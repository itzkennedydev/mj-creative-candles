import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '~/lib/mongodb';
import { sendAbandonedCartEmail } from '~/lib/email-service';
import { stripe } from '~/lib/stripe';

/**
 * POST /api/abandoned-cart - Process and send abandoned cart emails
 * This endpoint should be called by a cron job periodically (e.g., every hour)
 * 
 * Email schedule:
 * - Email 1: 1 hour after checkout session creation
 * - Email 2: 24 hours after checkout session creation
 * - Email 3: 48 hours after checkout session creation
 * 
 * Maximum 3 emails per incomplete checkout session
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add API key validation for security
    // For now, we'll allow it to be called from cron jobs
    
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const incompleteSessionsCollection = db.collection('incomplete_checkout_sessions');
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours
    
    let emailsSent = 0;
    let errors = 0;
    
    // Find incomplete checkout sessions that need emails
    // Only get sessions that are not completed, not expired, and haven't sent all 3 emails
    const incompleteSessions = await incompleteSessionsCollection
      .find({
        completed: { $ne: true },
        expired: { $ne: true },
        emailsSent: { $lt: 3 },
      })
      .toArray();
    
    console.log(`Found ${incompleteSessions.length} incomplete checkout sessions to process`);
    
    for (const session of incompleteSessions) {
      try {
        const createdAt = session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt);
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const emailsSentCount = session.emailsSent || 0;
        const emailSentAt = session.emailSentAt || [];
        
        // Determine which email to send (1, 2, or 3)
        // Email schedule:
        // - Email 1: 1 hour after checkout session creation
        // - Email 2: 24 hours after checkout session creation
        // - Email 3: 48 hours after checkout session creation
        let emailNumber = 0;
        let shouldSend = false;
        
        // Email 1: Send 1 hour after creation
        if (emailsSentCount === 0 && hoursSinceCreation >= 1 && hoursSinceCreation < 24) {
          emailNumber = 1;
          shouldSend = true;
        }
        // Email 2: Send 24 hours after creation (if email 1 was sent)
        else if (emailsSentCount === 1 && hoursSinceCreation >= 24 && hoursSinceCreation < 48) {
          emailNumber = 2;
          shouldSend = true;
        }
        // Email 3: Send 48 hours after creation (if email 2 was sent)
        else if (emailsSentCount === 2 && hoursSinceCreation >= 48) {
          emailNumber = 3;
          shouldSend = true;
        }
        
        if (!shouldSend || emailNumber === 0) {
          continue;
        }
        
        // Verify the checkout session is still valid with Stripe
        try {
          const stripeSession = await stripe.checkout.sessions.retrieve(session.sessionId);
          
          // If session is completed or expired, mark it in our database
          if (stripeSession.payment_status === 'paid' || stripeSession.status === 'complete') {
            await incompleteSessionsCollection.updateOne(
              { _id: session._id },
              { 
                $set: { 
                  completed: true,
                  completedAt: new Date(),
                  updatedAt: new Date(),
                }
              }
            );
            console.log(`Session ${session.sessionId} is already completed, skipping email`);
            continue;
          }
          
          if (stripeSession.status === 'expired') {
            await incompleteSessionsCollection.updateOne(
              { _id: session._id },
              { 
                $set: { 
                  expired: true,
                  expiredAt: new Date(),
                  updatedAt: new Date(),
                }
              }
            );
            console.log(`Session ${session.sessionId} is expired, skipping email`);
            continue;
          }
          
          // Get customer name from order if available
          let customerName: string | undefined;
          try {
            // Handle orderId - it might be a string or ObjectId
            const orderId = typeof session.orderId === 'string' 
              ? new ObjectId(session.orderId) 
              : session.orderId;
            
            const order = await db.collection('orders').findOne({ _id: orderId });
            if (order && order.customer) {
              customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || undefined;
            }
          } catch (error) {
            console.error('Error fetching order for customer name:', error);
            // Continue without customer name
          }
          
          // Send the abandoned cart email
          const emailSent = await sendAbandonedCartEmail({
            customerEmail: session.customerEmail,
            customerName,
            checkoutUrl: session.checkoutUrl,
            items: session.items || [],
            total: session.total || 0,
            emailNumber,
          });
          
          if (emailSent) {
            // Update session with email sent info
            const newEmailSentAt = [...(emailSentAt || []), new Date()];
            await incompleteSessionsCollection.updateOne(
              { _id: session._id },
              { 
                $set: { 
                  emailsSent: emailsSentCount + 1,
                  emailSentAt: newEmailSentAt,
                  updatedAt: new Date(),
                }
              }
            );
            
            emailsSent++;
            console.log(`✅ Sent abandoned cart email #${emailNumber} for session ${session.sessionId}`);
          } else {
            errors++;
            console.error(`Failed to send abandoned cart email #${emailNumber} for session ${session.sessionId}`);
          }
        } catch (stripeError) {
          console.error(`Error checking Stripe session ${session.sessionId}:`, stripeError);
          // If session doesn't exist in Stripe, mark as expired
          await incompleteSessionsCollection.updateOne(
            { _id: session._id },
            { 
              $set: { 
                expired: true,
                expiredAt: new Date(),
                updatedAt: new Date(),
              }
            }
          );
          continue;
        }
      } catch (error) {
        errors++;
        console.error(`Error processing session ${session.sessionId}:`, error);
        // Continue processing other sessions
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Abandoned cart processing completed',
      stats: {
        sessionsProcessed: incompleteSessions.length,
        emailsSent,
        errors,
      },
    });
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process abandoned carts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/abandoned-cart - Get stats about abandoned carts (for admin monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const incompleteSessionsCollection = db.collection('incomplete_checkout_sessions');
    
    const total = await incompleteSessionsCollection.countDocuments({});
    const incomplete = await incompleteSessionsCollection.countDocuments({
      completed: { $ne: true },
      expired: { $ne: true },
    });
    const completed = await incompleteSessionsCollection.countDocuments({ completed: true });
    const expired = await incompleteSessionsCollection.countDocuments({ expired: true });
    
    return NextResponse.json({
      success: true,
      stats: {
        total,
        incomplete,
        completed,
        expired,
      },
    });
  } catch (error) {
    console.error('Error fetching abandoned cart stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch abandoned cart stats' },
      { status: 500 }
    );
  }
}


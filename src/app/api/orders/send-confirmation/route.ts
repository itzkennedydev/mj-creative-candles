import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe } from '~/lib/stripe';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import clientPromise from '~/lib/mongodb';
import type { Order } from '~/lib/order-types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { sessionId: string };
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve and verify the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only send emails if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed', paymentStatus: session.payment_status },
        { status: 400 }
      );
    }

    // Get order ID from session metadata
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID not found in session metadata' },
        { status: 400 }
      );
    }

    // Retrieve the order from database
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');
    
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // IMPORTANT: Only send emails if the order status is 'paid' in the database
    // This ensures the webhook has verified and processed the payment first
    // The webhook is the authoritative source - it verifies Stripe's signature
    // and updates the order status to 'paid' after verification
    if (order.status !== 'paid') {
      // In development, allow direct verification via Stripe API as a fallback
      // since webhooks may not be configured for localhost
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment && session.payment_status === 'paid') {
        console.log(`[DEV MODE] Order ${order.orderNumber} is pending but Stripe confirms payment. Updating order status to 'paid'.`);
        
        // Update order status to paid (similar to webhook logic)
        const updateResult = await ordersCollection.updateOne(
          { 
            _id: new ObjectId(orderId),
            status: 'pending' // Only update if still pending
          },
          { 
            $set: { 
              status: 'paid',
              paymentIntentId: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id ?? undefined,
              paidAt: new Date(),
              stripeSessionId: session.id,
              stripeSubtotal: session.metadata?.subtotal ? parseFloat(session.metadata.subtotal) : undefined,
              stripeTax: session.metadata?.tax ? parseFloat(session.metadata.tax) : undefined,
              stripeTotal: session.metadata?.total ? parseFloat(session.metadata.total) : undefined,
              updatedAt: new Date(),
            }
          }
        );

        if (updateResult.matchedCount === 0) {
          // Order was already updated, fetch it again
          const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
          if (updatedOrder && updatedOrder.status === 'paid') {
            // Order is now paid, continue with email sending
            Object.assign(order, updatedOrder);
          } else {
            console.log(`[DEV MODE] Order ${order.orderNumber} update failed or was already processed.`);
            return NextResponse.json({
              success: false,
              message: 'Payment verification failed',
              orderNumber: order.orderNumber,
              orderStatus: order.status,
            }, { status: 202 });
          }
        } else {
          // Update successful, refresh order object
          const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
          if (updatedOrder) {
            Object.assign(order, updatedOrder);
          }
        }
        
        console.log(`[DEV MODE] ✅ Order ${order.orderNumber} updated to paid status via direct Stripe verification`);
      } else {
        // Production: Wait for webhook verification
        console.log(`Order ${order.orderNumber} status is '${order.status}', not 'paid'. Waiting for webhook to verify payment.`);
        return NextResponse.json({
          success: false,
          message: 'Payment not yet verified by webhook',
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          note: isDevelopment 
            ? 'In development, ensure Stripe CLI is forwarding webhooks or webhook secret is configured'
            : 'Emails will be sent automatically once the webhook verifies payment'
        }, { status: 202 }); // 202 Accepted - payment is pending webhook verification
      }
    }

    // Check if emails have already been sent (prevent duplicate emails)
    if (order.emailsSent) {
      console.log(`Emails already sent for order ${order.orderNumber} - likely sent by webhook`);
      return NextResponse.json({
        success: true,
        message: 'Emails already sent',
        orderNumber: order.orderNumber
      });
    }

    // Send confirmation emails with atomic update to prevent race conditions
    // This ensures only one process can send emails, even if webhook and success page hit simultaneously
    try {
      // Attempt to atomically mark emails as sent before sending (prevents race conditions)
      const updateResult = await ordersCollection.updateOne(
        { 
          _id: new ObjectId(orderId),
          emailsSent: { $ne: true } // Only update if emailsSent is not already true
        },
        { $set: { emailsSent: true, emailsSentAt: new Date() } }
      );

      // If update didn't match, emails were already sent (likely by webhook)
      if (updateResult.matchedCount === 0) {
        console.log(`Emails already being sent or sent for order ${order.orderNumber} - skipping duplicate`);
        return NextResponse.json({
          success: true,
          message: 'Emails already sent',
          orderNumber: order.orderNumber
        });
      }

      // Now send the emails (we've atomically marked them as sent)
      // Note: sendOrderConfirmationEmail has its own security check - it will return false
      // if order.status !== 'paid', providing defense in depth
      const emailSent = await sendOrderConfirmationEmail(order);

      if (!emailSent) {
        // Email function returned false - could be due to security check or other error
        // Unmark emailsSent so it can be retried
        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $unset: { emailsSent: '', emailsSentAt: '' } }
        );
        
        console.error(`Failed to send confirmation emails for order ${order.orderNumber} - email function returned false`);
        return NextResponse.json({
          success: false,
          message: 'Failed to send confirmation emails - payment verification required',
          orderNumber: order.orderNumber
        }, { status: 500 });
      }

      console.log(`✅ Confirmation emails sent for order ${order.orderNumber}`);
      
      return NextResponse.json({
        success: true,
        message: 'Confirmation emails sent successfully',
        orderNumber: order.orderNumber
      });
    } catch (emailError) {
      console.error('Error sending confirmation emails:', emailError);
      
      // If email sending failed, we should unmark emailsSent so it can be retried
      // But only if we successfully marked it (don't want to interfere with webhook)
      try {
        await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $unset: { emailsSent: '', emailsSentAt: '' } }
        );
      } catch (unmarkError) {
        console.error('Error unmarking emailsSent:', unmarkError);
      }
      
      // Still return success to avoid retries if there's a temporary email issue
      // The webhook will retry on next event if needed
      return NextResponse.json({
        success: false,
        message: 'Emails failed to send, but payment was successful',
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in send-confirmation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


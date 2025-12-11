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
      await sendOrderConfirmationEmail(order);

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


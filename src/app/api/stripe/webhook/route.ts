import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe } from '~/lib/stripe';
import { env } from '~/env.js';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import type { Order } from '~/lib/order-types';

// Configure route to use Node.js runtime and disable body parsing
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Handle OPTIONS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    // Verify webhook signature
    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`✅ Webhook signature verified for event: ${event.type} (${event.id})`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ Webhook signature verification failed:', {
      error: errorMessage,
      signatureLength: signature?.length,
      bodyLength: body?.length,
      hasWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET,
      webhookSecretPrefix: env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...'
    });
    return NextResponse.json(
      { 
        error: 'Invalid signature',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');

    // Check if we've already processed this event (idempotency check)
    const eventId = event.id;
    const processedEvent = await db.collection('webhook_events').findOne({ 
      eventId 
    });

    if (processedEvent) {
      console.log(`Event ${eventId} already processed, skipping`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Mark event as being processed
    await db.collection('webhook_events').insertOne({
      eventId,
      type: event.type,
      processedAt: new Date(),
      livemode: event.livemode,
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.warn('checkout.session.completed event missing orderId in metadata');
          return NextResponse.json({ received: true });
        }

        // Additional idempotency: Check if order is already marked as paid
        const existingOrder = await db.collection('orders').findOne({ 
          _id: new ObjectId(orderId) 
        });

        if (existingOrder?.status === 'paid' && existingOrder?.stripeSessionId === session.id) {
          console.log(`Order ${orderId} already marked as paid for session ${session.id}, skipping`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        // Update order status to paid
        const updateResult = await db.collection('orders').updateOne(
          { _id: new ObjectId(orderId) },
          { 
            $set: { 
              status: 'paid',
              paymentIntentId: session.payment_intent,
              paidAt: new Date(),
              // Store payment details from metadata
              stripeSessionId: session.id,
              stripeSubtotal: session.metadata?.subtotal ? parseFloat(session.metadata.subtotal) : undefined,
              stripeTax: session.metadata?.tax ? parseFloat(session.metadata.tax) : undefined,
              stripeTotal: session.metadata?.total ? parseFloat(session.metadata.total) : undefined,
              webhookEventId: eventId,
              updatedAt: new Date(),
            }
          }
        );

        if (updateResult.matchedCount === 0) {
          console.error(`Order ${orderId} not found when processing webhook`);
        } else {
          console.log(`Successfully updated order ${orderId} to paid status via webhook`);
          
          // Send email notifications immediately when payment is confirmed via webhook
          // This ensures notifications are sent as soon as payment is confirmed, not waiting for checkout page
          try {
            const ordersCollection = db.collection<Order>('orders');
            const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
            
            if (order && !order.emailsSent) {
              // Send confirmation emails immediately
              await sendOrderConfirmationEmail(order);
              
              // Mark that emails have been sent
              await ordersCollection.updateOne(
                { _id: new ObjectId(orderId) },
                { $set: { emailsSent: true, emailsSentAt: new Date() } }
              );
              
              console.log(`✅ Email notifications sent immediately for order ${order.orderNumber} via webhook`);
            } else if (order?.emailsSent) {
              console.log(`Order ${order.orderNumber} already had emails sent, skipping duplicate`);
            }
          } catch (emailError) {
            // Log error but don't fail the webhook - emails can be sent later via checkout success page
            console.error(`Error sending email notifications via webhook for order ${orderId}:`, emailError);
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.warn('checkout.session.expired event missing orderId in metadata');
          return NextResponse.json({ received: true });
        }

        // Only update if order is still pending (don't overwrite paid orders)
        const updateResult = await db.collection('orders').updateOne(
          { 
            _id: new ObjectId(orderId),
            status: 'pending' // Only update if still pending
          },
          { 
            $set: { 
              status: 'cancelled',
              failureReason: 'Checkout session expired',
              webhookEventId: eventId,
              updatedAt: new Date(),
            }
          }
        );

        if (updateResult.matchedCount === 0) {
          console.log(`Order ${orderId} not found or already processed, skipping expiration`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('❌ Webhook handler error:', {
      error: errorMessage,
      stack: errorStack,
      eventId: event?.id,
      eventType: event?.type
    });
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

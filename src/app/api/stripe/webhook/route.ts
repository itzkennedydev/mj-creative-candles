import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe } from '~/lib/stripe';
import { env } from '~/env.js';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';

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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
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
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

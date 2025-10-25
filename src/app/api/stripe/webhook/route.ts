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

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order status to paid
          await db.collection('orders').updateOne(
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
              }
            }
          );
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          // Update order status to cancelled
          await db.collection('orders').updateOne(
            { _id: new ObjectId(orderId) },
            { 
              $set: { 
                status: 'cancelled',
                failureReason: 'Checkout session expired'
              }
            }
          );
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

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

// In App Router, Next.js automatically parses the body based on Content-Type
// We need to read the raw body as text for Stripe signature verification
// Using request.text() gives us the raw body string which is what Stripe needs

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

// Handle GET requests (for testing/debugging)
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests from Stripe webhooks',
      allowedMethods: ['POST', 'OPTIONS']
    },
    { status: 405, headers: { 'Allow': 'POST, OPTIONS' } }
  );
}

export async function POST(request: NextRequest) {
  // Log incoming webhook request for debugging
  console.log('🔔 Stripe webhook POST request received:', {
    method: request.method,
    url: request.url,
    hasSignature: !!request.headers.get('stripe-signature'),
    contentType: request.headers.get('content-type'),
  });

  // Read the raw body as text - this is critical for signature verification
  // Stripe needs the exact raw body string that was sent
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ Webhook request missing stripe-signature header');
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  // Verify webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not set in environment variables');
    console.error('❌ This is likely a production environment variable issue');
    console.error('❌ Please set STRIPE_WEBHOOK_SECRET in your hosting platform (Vercel/etc)');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Validate webhook secret format
  if (!env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
    console.error('❌ STRIPE_WEBHOOK_SECRET has invalid format - should start with "whsec_"');
    console.error(`❌ Current prefix: ${env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...`);
    return NextResponse.json(
      { error: 'Invalid webhook secret format' },
      { status: 500 }
    );
  }

  let event;

  try {
    // Verify webhook signature using Stripe's constructEvent
    // This requires:
    // 1. The raw body string (exactly as sent by Stripe)
    // 2. The stripe-signature header
    // 3. The webhook secret from Stripe Dashboard (starting with whsec_)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`✅ Webhook signature verified for event: ${event.type} (${event.id})`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    
    // Log detailed error information for debugging
    const webhookSecretPreview = env.STRIPE_WEBHOOK_SECRET 
      ? `${env.STRIPE_WEBHOOK_SECRET.substring(0, 7)}...${env.STRIPE_WEBHOOK_SECRET.substring(env.STRIPE_WEBHOOK_SECRET.length - 4)}`
      : 'NOT SET';
    
    console.error('❌ Webhook signature verification failed:', {
      error: errorMessage,
      signatureLength: signature?.length,
      signaturePrefix: signature?.substring(0, 20) + '...',
      bodyLength: body?.length,
      bodyPreview: body?.substring(0, 100) + '...',
      webhookSecretPrefix: webhookSecretPreview,
      webhookSecretLength: env.STRIPE_WEBHOOK_SECRET?.length,
      expectedPrefix: 'whsec_',
      actualPrefix: env.STRIPE_WEBHOOK_SECRET?.substring(0, 6),
      hint: 'Common issues: 1) Webhook secret mismatch (check Stripe Dashboard), 2) Body was parsed/modified before verification, 3) Wrong endpoint URL configured in Stripe'
    });
    
    return NextResponse.json(
      { 
        error: 'Invalid signature',
        message: 'Webhook signature verification failed. Please verify your webhook secret matches the one in Stripe Dashboard for this endpoint.',
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

        // Additional idempotency: Check if order is already marked as paid for this session
        const existingOrder = await db.collection('orders').findOne({ 
          _id: new ObjectId(orderId) 
        });

        if (!existingOrder) {
          console.error(`Order ${orderId} not found when processing webhook`);
          return NextResponse.json({ received: true, error: 'Order not found' });
        }

        // Check if this exact session already processed this order
        if (existingOrder.status === 'paid' && existingOrder.stripeSessionId === session.id) {
          console.log(`Order ${orderId} already marked as paid for session ${session.id}, skipping duplicate`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        // Verify payment status before updating
        if (session.payment_status !== 'paid') {
          console.warn(`Session ${session.id} payment status is ${session.payment_status}, not 'paid'. Skipping order update.`);
          return NextResponse.json({ received: true, error: 'Payment not completed' });
        }

        // Update order status to paid (using atomic update to prevent race conditions)
        const updateResult = await db.collection('orders').updateOne(
          { 
            _id: new ObjectId(orderId),
            // Only update if order is still pending or doesn't have this session ID
            $or: [
              { status: 'pending' },
              { stripeSessionId: { $ne: session.id } }
            ]
          },
          { 
            $set: { 
              status: 'paid',
              paymentIntentId: typeof session.payment_intent === 'string' 
                ? session.payment_intent 
                : session.payment_intent?.id ?? undefined,
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
          console.log(`Order ${orderId} was already processed or doesn't match update criteria (may have been updated by another process)`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        console.log(`✅ Successfully updated order ${orderId} to paid status via webhook`);
        
        // Send email notifications immediately when payment is confirmed via webhook
        // Use atomic update to prevent duplicate emails (race condition protection)
        try {
          const ordersCollection = db.collection<Order>('orders');
          
          // Fetch the updated order
          const updatedOrder = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
          
          if (updatedOrder && !updatedOrder.emailsSent) {
            // Send confirmation emails immediately
            await sendOrderConfirmationEmail(updatedOrder);
            
            // Atomically mark that emails have been sent (prevents race conditions)
            await ordersCollection.updateOne(
              { 
                _id: new ObjectId(orderId),
                emailsSent: { $ne: true } // Only update if emailsSent is not already true
              },
              { $set: { emailsSent: true, emailsSentAt: new Date() } }
            );
            
            console.log(`✅ Email notifications sent immediately for order ${updatedOrder.orderNumber} via webhook`);
          } else if (updatedOrder?.emailsSent) {
            console.log(`Order ${updatedOrder.orderNumber} already had emails sent, skipping duplicate`);
          }
        } catch (emailError) {
          // Log error but don't fail the webhook - emails can be sent later via checkout success page
          console.error(`Error sending email notifications via webhook for order ${orderId}:`, emailError);
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

      case 'payment_intent.succeeded': {
        // Handle payment_intent.succeeded events
        // NOTE: This event is sent BEFORE checkout.session.completed
        // We should NOT update order status here to avoid conflicts
        // The checkout.session.completed event will handle the order update
        const paymentIntent = event.data.object;
        
        console.log(`Payment intent succeeded: ${paymentIntent.id}`, {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
        });

        // Only log - don't update order status here
        // The checkout.session.completed event will handle the order update
        // This prevents race conditions and duplicate processing
        console.log(`Payment intent ${paymentIntent.id} succeeded - waiting for checkout.session.completed to update order`);
        
        // Always return success - payment_intent.succeeded is informational
        // The checkout.session.completed event will handle the main order update
        break;
      }

      case 'charge.updated': {
        // Handle charge.updated events
        // These are informational updates about charge status changes
        const charge = event.data.object;
        
        console.log(`Charge updated: ${charge.id}`, {
          chargeId: charge.id,
          paymentIntentId: charge.payment_intent,
          status: charge.status,
          amount: charge.amount,
          currency: charge.currency,
        });

        // If we have a payment intent ID, try to update the order
        const paymentIntentId = typeof charge.payment_intent === 'string' 
          ? charge.payment_intent 
          : charge.payment_intent?.id;
          
        if (paymentIntentId) {
          const order = await db.collection('orders').findOne({
            paymentIntentId: paymentIntentId
          });

          if (order) {
            // Update order with charge information if needed
            // This is mainly informational, so we just log it
            console.log(`Charge ${charge.id} updated for order ${order._id.toString()}`);
          } else {
            console.log(`Charge ${charge.id} updated, but no matching order found for payment intent ${paymentIntentId}`);
          }
        }
        
        // Always return success - charge.updated is informational
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type} - returning success to acknowledge receipt`);
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

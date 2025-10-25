import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '~/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { amount: number; currency?: string; orderId?: string };
    const { amount, currency = 'usd', orderId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount, currency),
      currency,
      metadata: {
        orderId: orderId ?? '',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

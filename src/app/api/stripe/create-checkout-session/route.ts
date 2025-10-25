import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe } from '~/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { 
      orderId: string; 
      items: Array<{
        productId: number;
        productName: string;
        productPrice: number;
        quantity: number;
        selectedSize?: string;
        selectedColor?: string;
      }>;
      subtotal: number;
      tax: number;
      total: number;
      customerEmail: string;
    };
    
    const { orderId, items, subtotal, tax, total, customerEmail } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    // Create line items for Stripe Checkout
    const lineItems = items.map(item => {
      // Add $2 surcharge for 2XL size
      const sizeSurcharge = item.selectedSize === '2XL' ? 2 : 0;
      const unitPrice = item.productPrice + sizeSurcharge;
      
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.productName}${item.selectedSize ? ` (${item.selectedSize})` : ''}${item.selectedColor ? ` - ${item.selectedColor}` : ''}`,
          },
          unit_amount: Math.round(unitPrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add tax as a separate line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(tax * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/shop/checkout`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

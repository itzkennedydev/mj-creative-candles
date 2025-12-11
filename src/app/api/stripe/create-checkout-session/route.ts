import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { stripe } from '~/lib/stripe';
import { validateApiKey, logSecurityEvent } from '~/lib/security';
import clientPromise from '~/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Validate API key for checkout session creation
    if (!validateApiKey(request)) {
      logSecurityEvent(request, 'INVALID_API_KEY_CHECKOUT_ATTEMPT');
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      );
    }

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
      shippingCost?: number;
      discountCode?: string;
      discountAmount?: number;
      total: number;
      customerEmail: string;
    };
    
    const { orderId, items, subtotal, tax, shippingCost = 0, discountCode, discountAmount = 0, total, customerEmail } = body;

    // Validate required fields
    if (!orderId || !items || items.length === 0 || !customerEmail) {
      logSecurityEvent(request, 'INVALID_CHECKOUT_DATA', { 
        orderId: String(orderId || 'undefined'), 
        itemsCount: items?.length || 0, 
        customerEmail: String(customerEmail || 'undefined') 
      });
      return NextResponse.json(
        { error: 'Missing required fields: orderId, items, and customerEmail are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      logSecurityEvent(request, 'INVALID_EMAIL_CHECKOUT', { customerEmail });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate totals
    if (subtotal < 0 || tax < 0 || total < 0) {
      logSecurityEvent(request, 'INVALID_TOTALS_CHECKOUT', { subtotal, tax, total });
      return NextResponse.json(
        { error: 'Invalid totals - values must be positive' },
        { status: 400 }
      );
    }

    // Create line items for Stripe Checkout
    const lineItems = items.map(item => {
      // Note: productPrice already includes size surcharge (XXL: +$3, 3XL: +$5)
      // So we use it directly without adding surcharge again
      const unitPrice = item.productPrice;
      
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

    // Add discount as a separate line item if applicable
    if (discountAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Discount${discountCode ? ` (${discountCode})` : ''}`,
          },
          unit_amount: -Math.round(discountAmount * 100), // Negative amount for discount
        },
        quantity: 1,
      });
    }

    // Add shipping as a separate line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Get the base URL dynamically
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 
      origin ?? 
      (referer ? referer.replace(/\/[^\/]*$/, '') : null) ?? 
      'http://localhost:3000';

    console.log('🔗 Stripe checkout URLs:', {
      baseUrl,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/shop/checkout`,
      origin,
      referer,
      nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop/checkout`,
      customer_email: customerEmail,
      metadata: {
        orderId: orderId,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
        ...(discountCode && { discountCode: discountCode }),
        ...(discountAmount > 0 && { discountAmount: discountAmount.toString() }),
      },
    });

    logSecurityEvent(request, 'CHECKOUT_SESSION_CREATED', { orderId, customerEmail, sessionId: session.id });

    // Store incomplete checkout session for abandoned cart emails
    if (session.url) {
      try {
        const client = await clientPromise;
        const db = client.db('stitch_orders');
        const incompleteSessionsCollection = db.collection('incomplete_checkout_sessions');
        
        await incompleteSessionsCollection.insertOne({
          sessionId: session.id,
          checkoutUrl: session.url,
          customerEmail: customerEmail,
          orderId: orderId,
          items: items,
          subtotal: subtotal,
          tax: tax,
          shippingCost: shippingCost,
          total: total,
          emailsSent: 0,
          emailSentAt: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log(`✅ Stored incomplete checkout session ${session.id} for abandoned cart tracking`);
      } catch (error) {
        console.error('Error storing incomplete checkout session:', error);
        // Don't fail the request if tracking fails
      }
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    logSecurityEvent(request, 'CHECKOUT_SESSION_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

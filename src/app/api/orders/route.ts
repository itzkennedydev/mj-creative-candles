import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import type { CreateOrderRequest, Order } from '~/lib/order-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateOrderRequest;
    
    // Validate required fields
    if (!body.customer || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Generate order number
    const orderNumber = `SP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order document
    const order: Omit<Order, '_id'> = {
      orderNumber,
      customer: body.customer,
      shipping: body.shipping,
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      shippingCost: body.shippingCost,
      total: body.total,
      status: 'pending',
      paymentMethod: body.paymentMethod,
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert order into database
    const result = await ordersCollection.insertOne(order);

    if (result.insertedId) {
      // Send email notifications
      const fullOrder: Order = {
        _id: result.insertedId.toString(),
        ...order
      };
      
      try {
        await sendOrderConfirmationEmail(fullOrder);
        console.log('Email notifications sent successfully');
      } catch (emailError) {
        console.error('Error sending email notifications:', emailError);
        // Don't fail the order creation if email fails
      }

      return NextResponse.json({
        success: true,
        orderId: result.insertedId,
        orderNumber: orderNumber
      });
    } else {
      throw new Error('Failed to create order');
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') ?? '50');

    // Build query
    const query: { status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' } = {};
    if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      query.status = status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    }

    // Fetch orders
    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

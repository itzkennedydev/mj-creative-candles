import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendPickupReadyEmail } from '~/lib/email-service';
import type { Order } from '~/lib/order-types';
import { authenticateRequest } from '~/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const body = await request.json() as {
      orderId: string;
      pickupTime: string;
      customMessage?: string;
    };

    const { orderId, pickupTime, customMessage } = body;

    if (!orderId || !pickupTime) {
      return NextResponse.json(
        { error: 'Order ID and pickup time are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('mj-creative-candles');
    const ordersCollection = db.collection<Order>('orders');

    // Find the order
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send pickup ready email
    await sendPickupReadyEmail({
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      orderNumber: order.orderNumber,
      pickupTime: new Date(pickupTime),
      customMessage: customMessage ?? '',
      items: order.items,
      total: order.total
    });

    return NextResponse.json({
      success: true,
      message: 'Pickup notification sent successfully'
    });

  } catch (error) {
    console.error('Error sending pickup notification:', error);
    return NextResponse.json(
      { error: 'Failed to send pickup notification' },
      { status: 500 }
    );
  }
}

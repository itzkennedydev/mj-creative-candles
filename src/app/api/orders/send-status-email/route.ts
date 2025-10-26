import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendStatusUpdateEmail } from '~/lib/email-service';
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
      status: string;
    };
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Find the order
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Send status update email
    await sendStatusUpdateEmail({
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      customerEmail: order.customer.email,
      orderNumber: order.orderNumber,
      status,
      items: order.items,
      total: order.total
    });

    return NextResponse.json({
      success: true,
      message: 'Status update email sent successfully'
    });

  } catch (error) {
    console.error('Error sending status update email:', error);
    return NextResponse.json(
      { error: 'Failed to send status update email' },
      { status: 500 }
    );
  }
}

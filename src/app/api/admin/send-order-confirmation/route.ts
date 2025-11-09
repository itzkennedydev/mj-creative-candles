import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import clientPromise from '~/lib/mongodb';
import type { Order } from '~/lib/order-types';
import { ObjectId } from 'mongodb';
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

    const body = await request.json() as { orderId?: string; orderNumber?: string };

    if (!body.orderId && !body.orderNumber) {
      return NextResponse.json(
        { error: 'Order ID or Order Number is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Find order by ID or order number
    let order: Order | null = null;
    if (body.orderId) {
      if (!ObjectId.isValid(body.orderId)) {
        return NextResponse.json(
          { error: 'Invalid order ID format' },
          { status: 400 }
        );
      }
      order = await ordersCollection.findOne({ _id: new ObjectId(body.orderId) });
    } else if (body.orderNumber) {
      order = await ordersCollection.findOne({ orderNumber: body.orderNumber });
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order status is 'paid'
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: `Order status is '${order.status}', not 'paid'. Confirmation emails are only sent for paid orders.` },
        { status: 400 }
      );
    }

    // Send confirmation emails
    const emailSent = await sendOrderConfirmationEmail(order);

    if (emailSent) {
      // Mark emails as sent (if not already marked)
      await ordersCollection.updateOne(
        { _id: order._id },
        { 
          $set: { 
            emailsSent: true, 
            emailsSentAt: new Date() 
          } 
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Confirmation emails sent successfully',
        orderNumber: order.orderNumber
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send confirmation emails' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in send-order-confirmation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



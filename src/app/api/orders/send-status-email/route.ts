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
    
    // Parse request body - handle both mobile and desktop formats
    let body: { orderId?: string; status?: string };
    try {
      body = await request.json() as { orderId?: string; status?: string };
    } catch (parseError) {
      console.error('[send-status-email] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }

    const { orderId, status } = body;

    console.log(`[send-status-email] Received request - orderId: ${orderId}, status: "${status}"`);

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Validate order ID format
    if (!ObjectId.isValid(orderId)) {
      console.error(`[send-status-email] Invalid order ID format: ${orderId}`);
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // Validate status format
    const validStatuses = ['processing', 'ready_for_pickup', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      console.error(`[send-status-email] Invalid status: ${status}. Valid statuses: ${validStatuses.join(', ')}`);
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('mj-creative-candles');
    const ordersCollection = db.collection<Order>('orders');

    // Find the order
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      console.error(`[send-status-email] Order not found: ${orderId}`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`[send-status-email] Found order ${order.orderNumber}`);
    console.log(`[send-status-email] Customer email: ${order.customer.email}`);
    console.log(`[send-status-email] Customer name: ${order.customer.firstName} ${order.customer.lastName}`);

    // Send status update email
    console.log(`[send-status-email] Sending email for status: "${status}"`);
    try {
      await sendStatusUpdateEmail({
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        orderNumber: order.orderNumber,
        status,
        items: order.items,
        total: order.total
      });

      console.log(`[send-status-email] Email sent successfully for status: "${status}"`);

      return NextResponse.json({
        success: true,
        message: 'Status update email sent successfully'
      });
    } catch (emailError) {
      console.error(`[send-status-email] Error sending email:`, emailError);
      // Don't fail the request if email fails - log it but return success
      // The status update was successful, email is secondary
      return NextResponse.json({
        success: true,
        message: 'Status update email attempted (check logs for details)',
        warning: 'Email sending may have failed'
      });
    }

  } catch (error) {
    console.error('[send-status-email] Error processing request:', error);
    
    // If it's an ObjectId error, return a more helpful message
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send status update email' },
      { status: 500 }
    );
  }
}

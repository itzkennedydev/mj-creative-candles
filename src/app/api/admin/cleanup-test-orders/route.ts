import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate request - only admin can delete orders
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    
    // Clean up primary database only
    const results = {
      deleted: 0,
      orders: [] as string[]
    };

    // Clean stitch_orders database (primary)
    try {
      const db = client.db('mj-creative-candles');
      const ordersCollection = db.collection('orders');
      
      // Find Kennedy test orders
      const kennedyOrders = await ordersCollection.find({
        $or: [
          { 'customer.firstName': { $regex: /kennedy/i } },
          { 'customer.lastName': { $regex: /kennedy/i } },
          { 'customer.email': { $regex: /kennedy/i } },
          { 'customer.email': { $regex: /test/i } },
          { 'customer.email': { $regex: /example\.com/i } },
          { orderNumber: { $regex: /test/i } }
        ]
      }).toArray();

      if (kennedyOrders.length > 0) {
        const orderIds = kennedyOrders.map(order => order._id?.toString()).filter(Boolean);
        const deleteResult = await ordersCollection.deleteMany({
          _id: { $in: kennedyOrders.map(order => order._id) }
        });
        
        results.deleted = deleteResult.deletedCount || 0;
        results.orders = orderIds;
        
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} test orders from stitch_orders database`);
        console.log('Deleted order IDs:', orderIds);
      }
    } catch (error) {
      console.error('Error cleaning stitch_orders database:', error);
    }

    const totalDeleted = results.deleted;

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${totalDeleted} test orders`,
      results
    });

  } catch (error) {
    console.error('Error cleaning up test orders:', error);
    return NextResponse.json(
      { error: 'Failed to clean up test orders' },
      { status: 500 }
    );
  }
}

// Also provide a GET endpoint to preview what would be deleted
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    
    const preview = {
      count: 0,
      orders: [] as any[]
    };

    // Preview stitch_orders database (primary)
    try {
      const db = client.db('mj-creative-candles');
      const ordersCollection = db.collection('orders');
      
      const kennedyOrders = await ordersCollection.find({
        $or: [
          { 'customer.firstName': { $regex: /kennedy/i } },
          { 'customer.lastName': { $regex: /kennedy/i } },
          { 'customer.email': { $regex: /kennedy/i } },
          { 'customer.email': { $regex: /test/i } },
          { 'customer.email': { $regex: /example\.com/i } },
          { orderNumber: { $regex: /test/i } }
        ]
      }).toArray();

      preview.count = kennedyOrders.length;
      preview.orders = kennedyOrders.map(order => ({
        id: order._id?.toString(),
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error('Error previewing stitch_orders database:', error);
    }

    const totalCount = preview.count;

    return NextResponse.json({
      success: true,
      message: `Found ${totalCount} test orders that would be deleted`,
      preview
    });

  } catch (error) {
    console.error('Error previewing test orders:', error);
    return NextResponse.json(
      { error: 'Failed to preview test orders' },
      { status: 500 }
    );
  }
}

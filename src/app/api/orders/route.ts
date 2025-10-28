import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import type { CreateOrderRequest, Order } from '~/lib/order-types';
import type { OrderItem as ApiOrderItem } from '~/lib/order-types';
import { authenticateRequest } from '~/lib/auth';

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
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const skip = (page - 1) * limit;

        // Build query
        const query: Record<string, unknown> = {};
        
        // Status filter
        if (status && ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
          query.status = status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
        }

        // Search filter
        if (search) {
          query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'customer.firstName': { $regex: search, $options: 'i' } },
            { 'customer.lastName': { $regex: search, $options: 'i' } },
            { 'customer.email': { $regex: search, $options: 'i' } },
            { 'customer.phone': { $regex: search, $options: 'i' } }
          ];
        }

    // Get total count for pagination
    const total = await ordersCollection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Fetch orders with pagination
    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform orders to match iOS Order model
    const serializedOrders = orders.map(order => {
      // Transform order items to match iOS OrderItem model
      const transformedItems = order.items.map((item: ApiOrderItem) => {
        const productIdValue = (item as unknown as { productId?: string | number }).productId;
        return {
          productId: productIdValue !== undefined ? String(productIdValue) : '',
          productName: item.productName,
          quantity: item.quantity,
          price: item.productPrice,
          customizations: item.selectedSize ? `Size: ${item.selectedSize}` : undefined
        };
      });

      return {
        id: order._id.toString(),
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        items: transformedItems,
        totalAmount: order.total,
        status: order.status,
        orderDate: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
        createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
        updatedAt: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
        // Keep original fields for backward compatibility
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        customer: order.customer,
        shipping: order.shipping,
        subtotal: order.subtotal,
        tax: order.tax,
        shippingCost: order.shippingCost,
        total: order.total,
        paymentMethod: order.paymentMethod,
        notes: order.notes,
        paidAt: order.paidAt ? (order.paidAt instanceof Date ? order.paidAt.toISOString() : order.paidAt) : undefined
      };
    });

    return NextResponse.json({
      success: true,
      orders: serializedOrders,
      totalCount: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

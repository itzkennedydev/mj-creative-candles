import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { sendOrderConfirmationEmail } from '~/lib/email-service';
import type { CreateOrderRequest, Order } from '~/lib/order-types';
import type { OrderItem as ApiOrderItem } from '~/lib/order-types';
import { authenticateRequest } from '~/lib/auth';
import { validateApiKey, validateOrderData, sanitizeString, logSecurityEvent } from '~/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Validate API key for order creation
    if (!validateApiKey(request)) {
      logSecurityEvent(request, 'INVALID_API_KEY_ATTEMPT');
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      );
    }

    const body = await request.json() as CreateOrderRequest;
    
    // Validate and sanitize order data
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      logSecurityEvent(request, 'INVALID_ORDER_DATA', { errors: validation.errors });
      return NextResponse.json(
        { error: 'Invalid order data', details: validation.errors },
        { status: 400 }
      );
    }

    // Sanitize customer data
    const sanitizedCustomer = {
      firstName: sanitizeString(body.customer.firstName, 50),
      lastName: sanitizeString(body.customer.lastName, 50),
      email: body.customer.email.toLowerCase().trim(),
      phone: body.customer.phone.replace(/[^\d+\-\(\)\s]/g, ''),
    };

    // Sanitize shipping data
    const sanitizedShipping = {
      street: sanitizeString(body.shipping.street, 200),
      city: sanitizeString(body.shipping.city, 50),
      state: sanitizeString(body.shipping.state, 50),
      zipCode: sanitizeString(body.shipping.zipCode, 20),
      country: sanitizeString(body.shipping.country, 50),
    };

    // Sanitize notes
    const sanitizedNotes = body.notes ? sanitizeString(body.notes, 500) : undefined;

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection<Order>('orders');

    // Check for duplicate orders from the same customer
    // First check: Within last 5 minutes (for rapid double submissions)
    // Second check: Any pending/paid order with same email, phone, total, and items (for retries/network issues)
    const fiveMinutesAgo = new Date(Date.now() - 300000);
    
    // Check 1: Rapid duplicates within 5 minutes
    const recentDuplicate = await ordersCollection.findOne({
      'customer.email': sanitizedCustomer.email,
      'customer.phone': sanitizedCustomer.phone,
      createdAt: { $gte: fiveMinutesAgo },
      total: body.total,
      status: { $in: ['pending', 'paid', 'processing'] }
    });

    // Check 2: If no recent duplicate found, check for any pending order with same details
    // This catches cases where user retried after network timeout
    let exactDuplicate = null;
    if (!recentDuplicate) {
      // Check for orders with same email, phone, total, same number of items, and same item details
      const matchingOrders = await ordersCollection.find({
        'customer.email': sanitizedCustomer.email,
        'customer.phone': sanitizedCustomer.phone,
        total: body.total,
        status: { $in: ['pending', 'paid', 'processing'] },
        'items.0.productName': body.items[0]?.productName, // Match first item product name
        'items.0.quantity': body.items[0]?.quantity // Match first item quantity
      }).sort({ createdAt: -1 }).limit(5).toArray();

      // Verify the orders have identical items
      for (const order of matchingOrders) {
        if (order.items.length === body.items.length) {
          const orderItemsMatch = order.items.every((orderItem: any, index: number) => {
            const newItem = body.items[index];
            return orderItem.productId === newItem.productId &&
                   orderItem.productName === newItem.productName &&
                   orderItem.quantity === newItem.quantity &&
                   orderItem.productPrice === newItem.productPrice;
          });

          if (orderItemsMatch) {
            exactDuplicate = order;
            break;
          }
        }
      }
    }

    const duplicate = recentDuplicate || exactDuplicate;
    if (duplicate) {
      const timeDiff = recentDuplicate 
        ? (Date.now() - new Date(duplicate.createdAt).getTime()) / 1000
        : null;
      const reason = recentDuplicate 
        ? `within ${Math.round((timeDiff || 0) / 60)} minute(s)` 
        : 'exact match (same customer, total, and items)';
      
      console.warn(`⚠️ Duplicate order detected for ${sanitizedCustomer.email} - ${reason}. Returning existing order.`);
      logSecurityEvent(request, 'DUPLICATE_ORDER_PREVENTED', { 
        customerEmail: sanitizedCustomer.email,
        existingOrderId: duplicate._id.toString(),
        reason: recentDuplicate ? 'recent_duplicate' : 'exact_duplicate',
        timeDifference: timeDiff
      });
      
      return NextResponse.json({
        success: true,
        orderId: duplicate._id,
        orderNumber: duplicate.orderNumber,
        isDuplicate: true
      });
    }

    // Generate order number
    const orderNumber = `SP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order document with sanitized data
    const order: Omit<Order, '_id'> = {
      orderNumber,
      customer: sanitizedCustomer,
      shipping: sanitizedShipping,
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      shippingCost: body.shippingCost,
      total: body.total,
      status: 'pending',
      paymentMethod: body.paymentMethod,
      notes: sanitizedNotes,
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

      logSecurityEvent(request, 'ORDER_CREATED', { orderNumber, customerEmail: sanitizedCustomer.email });

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
    logSecurityEvent(request, 'ORDER_CREATION_ERROR', { error: error instanceof Error ? error.message : 'Unknown error' });
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

    // Deduplicate orders by ID (safety measure in case duplicates exist in database)
    const uniqueOrdersMap = new Map<string, typeof serializedOrders[0]>();
    for (const order of serializedOrders) {
      if (!uniqueOrdersMap.has(order.id)) {
        uniqueOrdersMap.set(order.id, order);
      } else {
        console.warn(`⚠️ Duplicate order ID found in API response: ${order.id}`);
      }
    }
    const uniqueOrders = Array.from(uniqueOrdersMap.values());

    // Update total count if we removed duplicates
    const actualTotal = uniqueOrders.length < serializedOrders.length 
      ? total - (serializedOrders.length - uniqueOrders.length)
      : total;

    return NextResponse.json({
      success: true,
      orders: uniqueOrders,
      totalCount: actualTotal,
      page: page,
      limit: limit,
      totalPages: Math.ceil(actualTotal / limit),
      hasNextPage: page < Math.ceil(actualTotal / limit),
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

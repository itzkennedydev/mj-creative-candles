import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import type { CreateOrderRequest, Order } from "~/lib/order-types";
import type { OrderItem as ApiOrderItem } from "~/lib/order-types";
import { authenticateRequest } from "~/lib/auth";
import {
  validateApiKey,
  validateOrderData,
  sanitizeString,
  logSecurityEvent,
} from "~/lib/security";

export async function POST(request: NextRequest) {
  try {
    // Validate API key for order creation
    if (!validateApiKey(request)) {
      logSecurityEvent(request, "INVALID_API_KEY_ATTEMPT");
      return NextResponse.json(
        { error: "Unauthorized - Valid API key required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CreateOrderRequest;

    // Validate and sanitize order data
    const validation = validateOrderData(body);
    if (!validation.isValid) {
      logSecurityEvent(request, "INVALID_ORDER_DATA", {
        errors: validation.errors,
      });
      return NextResponse.json(
        { error: "Invalid order data", details: validation.errors },
        { status: 400 },
      );
    }

    // Sanitize customer data
    const sanitizedCustomer = {
      firstName: sanitizeString(body.customer.firstName, 50),
      lastName: sanitizeString(body.customer.lastName, 50),
      email: body.customer.email.toLowerCase().trim(),
      phone: body.customer.phone.replace(/[^\d+\-\(\)\s]/g, ""),
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
    const sanitizedNotes = body.notes
      ? sanitizeString(body.notes, 500)
      : undefined;

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const ordersCollection = db.collection<Order>("orders");

    // Generate order number
    const orderNumber = `SP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create order document with sanitized data
    const order: Omit<Order, "_id"> = {
      orderNumber,
      customer: sanitizedCustomer,
      shipping: sanitizedShipping,
      items: body.items,
      subtotal: body.subtotal,
      tax: body.tax,
      shippingCost: body.shippingCost,
      discountCode: body.discountCode,
      discountAmount: body.discountAmount,
      total: body.total,
      status: "pending",
      paymentMethod: body.paymentMethod,
      notes: sanitizedNotes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert order into database
    const result = await ordersCollection.insertOne(order);

    if (result.insertedId) {
      // Note: Email notifications are sent after payment is confirmed on the checkout success page
      logSecurityEvent(request, "ORDER_CREATED", {
        orderNumber,
        customerEmail: sanitizedCustomer.email,
      });

      return NextResponse.json({
        success: true,
        orderId: result.insertedId,
        orderNumber: orderNumber,
      });
    } else {
      throw new Error("Failed to create order");
    }
  } catch (error) {
    console.error("Error creating order:", error);
    logSecurityEvent(request, "ORDER_CREATION_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// Cache configuration - orders change frequently, shorter cache
export const revalidate = 10; // Revalidate every 10 seconds
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }
    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const ordersCollection = db.collection<Order>("orders");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};

    // Status filter
    if (
      status &&
      [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "paid",
      ].includes(status)
    ) {
      const statusFilter = status as
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "paid";
      if (statusFilter === "pending") {
        // For pending status, only show paid pending orders (exclude incomplete transactions)
        query.status = "pending";
        query.paidAt = { $exists: true, $ne: null };
      } else {
        // For other statuses, use the status filter (these are already completed/cancelled, so no incomplete exclusion needed)
        query.status = statusFilter;
      }
    } else {
      // No status filter: Exclude incomplete transactions (pending orders without payment confirmation)
      // Only show orders that have been paid or have progressed beyond pending
      query.$or = [
        { status: { $ne: "pending" } }, // All non-pending orders
        { status: "pending", paidAt: { $exists: true, $ne: null } }, // Pending orders that have been paid
      ];
    }

    // Search filter
    if (search) {
      const searchFilter = {
        $or: [
          { orderNumber: { $regex: search, $options: "i" } },
          { "customer.firstName": { $regex: search, $options: "i" } },
          { "customer.lastName": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
          { "customer.phone": { $regex: search, $options: "i" } },
        ],
      };

      // Combine search filter with existing query using $and
      const existingConditions = { ...query };
      query.$and = [existingConditions, searchFilter];
      // Remove properties that are now in $and
      Object.keys(existingConditions).forEach((key) => {
        delete query[key];
      });
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
    const serializedOrders = orders.map((order) => {
      // Transform order items to match iOS OrderItem model
      const transformedItems = order.items.map((item: ApiOrderItem) => {
        const productIdValue = (
          item as unknown as { productId?: string | number }
        ).productId;
        return {
          productId: productIdValue !== undefined ? String(productIdValue) : "",
          productName: item.productName,
          quantity: item.quantity,
          price: item.productPrice,
          customizations: item.selectedSize
            ? `Size: ${item.selectedSize}`
            : undefined,
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
        orderDate:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : order.createdAt,
        createdAt:
          order.createdAt instanceof Date
            ? order.createdAt.toISOString()
            : order.createdAt,
        updatedAt:
          order.updatedAt instanceof Date
            ? order.updatedAt.toISOString()
            : order.updatedAt,
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
        paidAt: order.paidAt
          ? order.paidAt instanceof Date
            ? order.paidAt.toISOString()
            : order.paidAt
          : undefined,
      };
    });

    // Generate ETag based on query params and data
    const etag = `"${total}-${page}-${status || "all"}-${search || "none"}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return NextResponse.json(
      {
        success: true,
        orders: serializedOrders,
        totalCount: total,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, must-revalidate",
          "CDN-Cache-Control": "private, no-cache",
          ETag: etag,
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

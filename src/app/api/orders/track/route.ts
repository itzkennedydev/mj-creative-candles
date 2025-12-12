import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import type { Order } from "~/lib/order-types";
import { sanitizeString, logSecurityEvent } from "~/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email: string;
      orderNumber: string;
    };

    // Validate input
    if (!body.email || !body.orderNumber) {
      return NextResponse.json(
        { error: "Email and order number are required" },
        { status: 400 },
      );
    }

    // Sanitize and validate email
    const email = body.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Sanitize order number
    const orderNumber = sanitizeString(body.orderNumber.trim(), 50);

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const ordersCollection = db.collection<Order>("orders");

    // Find order by email and order number
    const order = await ordersCollection.findOne({
      "customer.email": email,
      orderNumber: orderNumber,
    });

    if (!order) {
      logSecurityEvent(request, "ORDER_TRACKING_FAILED", {
        email,
        orderNumber,
      });
      return NextResponse.json(
        { error: "Order not found. Please check your email and order number." },
        { status: 404 },
      );
    }

    logSecurityEvent(request, "ORDER_TRACKED", {
      orderNumber,
      email,
    });

    // Return order information (excluding sensitive data)
    return NextResponse.json(
      {
        success: true,
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          paidAt: order.paidAt,
          completedAt: order.completedAt,
          items: order.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.productPrice,
            selectedSize: item.selectedSize,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          shippingCost: order.shippingCost,
          total: order.total,
          shipping: order.shipping,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, must-revalidate",
          "CDN-Cache-Control": "private, no-cache",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Error tracking order:", error);
    logSecurityEvent(request, "ORDER_TRACKING_ERROR", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "Failed to track order" },
      { status: 500 },
    );
  }
}

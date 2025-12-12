import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import type { Order } from "~/lib/order-types";
import { ObjectId } from "mongodb";
import { authenticateRequest } from "~/lib/auth";
import { sendOrderConfirmationEmail } from "~/lib/email-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Serialize order properly for JSON response
    const serializedOrder = {
      ...order,
      _id: order._id.toString(),
      createdAt:
        order.createdAt instanceof Date
          ? order.createdAt.toISOString()
          : order.createdAt,
      updatedAt:
        order.updatedAt instanceof Date
          ? order.updatedAt.toISOString()
          : order.updatedAt,
      ...(order.paidAt && {
        paidAt:
          order.paidAt instanceof Date
            ? order.paidAt.toISOString()
            : order.paidAt,
      }),
    };

    return NextResponse.json(
      {
        success: true,
        order: serializedOrder,
      },
      {
        headers: {
          "Cache-Control": "private, no-cache, must-revalidate",
          "CDN-Cache-Control": "private, no-cache",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const { id } = await params;

    // Validate order ID format to prevent invalid ObjectId errors
    if (!id || !ObjectId.isValid(id)) {
      console.error(`[PUT /api/orders/${id}] Invalid order ID format: ${id}`);
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    // Parse request body - handle both mobile and desktop formats
    let body: { status?: string; notes?: string; archived?: boolean };
    try {
      body = (await request.json()) as {
        status?: string;
        notes?: string;
        archived?: boolean;
      };
    } catch (parseError) {
      console.error(
        `[PUT /api/orders/${id}] Failed to parse request body:`,
        parseError,
      );
      return NextResponse.json(
        { error: "Invalid request body format" },
        { status: 400 },
      );
    }

    const { status, notes, archived } = body;

    // Validate status if provided
    const validStatuses = [
      "pending",
      "processing",
      "ready_for_pickup",
      "shipped",
      "delivered",
      "cancelled",
      "paid",
      "payment_failed",
    ];
    if (status && !validStatuses.includes(status)) {
      console.error(`[PUT /api/orders/${id}] Invalid status: ${status}`);
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const ordersCollection = db.collection<Order>("orders");

    // CRITICAL: Verify order exists BEFORE attempting update
    // This prevents any accidental order creation
    const existingOrder = await ordersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingOrder) {
      console.error(
        `[PUT /api/orders/${id}] Order not found - cannot update non-existent order`,
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log(
      `[PUT /api/orders/${id}] Updating order ${existingOrder.orderNumber || id} - Status: ${status || "unchanged"}, Notes: ${notes ? "provided" : "none"}, Archived: ${archived !== undefined ? archived : "unchanged"}`,
    );

    // Fetch the order to calculate score if marking as delivered
    let order: Order | null = existingOrder;
    if (status === "delivered") {
      order = existingOrder;
    }

    const updateData: {
      updatedAt: Date;
      status?:
        | "pending"
        | "processing"
        | "ready_for_pickup"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "paid"
        | "payment_failed";
      notes?: string;
      archived?: boolean;
      archivedAt?: Date;
      completedAt?: Date;
      score?: number;
      paidAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status as
        | "pending"
        | "processing"
        | "ready_for_pickup"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "paid"
        | "payment_failed";
      // Set paidAt timestamp when status is changed to 'paid'
      if (status === "paid" && existingOrder.status !== "paid") {
        updateData.paidAt = new Date();
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (archived !== undefined) {
      updateData.archived = archived;
      if (archived) {
        updateData.archivedAt = new Date();
      }
    }

    // Calculate score when marking as delivered
    if (status === "delivered" && order) {
      const completedAt = new Date();
      updateData.completedAt = completedAt;

      // Calculate hours to complete
      const createdAt =
        order.createdAt instanceof Date
          ? order.createdAt
          : new Date(order.createdAt);
      const hoursToComplete =
        (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      // Scoring system:
      // Target: 7 business days (168 hours)
      // - Complete within 5 days (120 hours): 100 points
      // - Complete within 7 days (168 hours): 80 points
      // - Complete within 10 days (240 hours): 60 points
      // - Complete within 14 days (336 hours): 40 points
      // - Over 14 days: 20 points
      let score: number;
      if (hoursToComplete <= 120) {
        score = 100;
      } else if (hoursToComplete <= 168) {
        score = 80;
      } else if (hoursToComplete <= 240) {
        score = 60;
      } else if (hoursToComplete <= 336) {
        score = 40;
      } else {
        score = 20;
      }

      updateData.score = score;
    }

    // Build update operator - use updateOne with explicit filter to ensure we only update existing orders
    const updateOperator: {
      $set: Record<string, unknown>;
      $unset?: { archivedAt: 1 };
    } = {
      $set: { ...updateData },
    };

    if (archived === false) {
      // When unarchiving, remove archivedAt from $set and add $unset
      delete updateOperator.$set.archivedAt;
      updateOperator.$unset = { archivedAt: 1 };
    }

    // Use updateOne with explicit _id filter - this will NEVER create a new document
    const result = await ordersCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperator,
    );

    if (result.matchedCount === 0) {
      // This should never happen since we verified the order exists above
      // But handle it just in case of race conditions
      console.error(
        `[PUT /api/orders/${id}] Order was not found during update (race condition?)`,
      );
      return NextResponse.json(
        { error: "Order not found during update" },
        { status: 404 },
      );
    }

    console.log(
      `[PUT /api/orders/${id}] Successfully updated order - Modified: ${result.modifiedCount > 0}`,
    );

    // If status was changed to 'paid', send confirmation emails (same as Stripe webhook)
    if (status === "paid" && existingOrder.status !== "paid") {
      // Fetch the updated order to send emails
      const updatedOrder = await ordersCollection.findOne({
        _id: new ObjectId(id),
      });

      if (updatedOrder && !updatedOrder.emailsSent) {
        console.log(
          `[PUT /api/orders/${id}] Order status changed to 'paid' - sending confirmation emails`,
        );

        try {
          const emailSent = await sendOrderConfirmationEmail(updatedOrder);

          if (emailSent) {
            // Mark emails as sent to prevent duplicates
            await ordersCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: { emailsSent: true, emailsSentAt: new Date() } },
            );
            console.log(
              `[PUT /api/orders/${id}] ✅ Confirmation emails sent successfully`,
            );
          } else {
            console.warn(
              `[PUT /api/orders/${id}] ⚠️  Failed to send confirmation emails - email function returned false`,
            );
          }
        } catch (emailError) {
          console.error(
            `[PUT /api/orders/${id}] ✗ Error sending confirmation emails:`,
            emailError,
          );
          // Don't fail the order update if email fails - order was successfully updated
        }
      } else if (updatedOrder?.emailsSent) {
        console.log(
          `[PUT /api/orders/${id}] Order already had emails sent, skipping duplicate`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error(
      `[PUT /api/orders/${await params.then((p) => p.id)}] Error updating order:`,
      error,
    );

    // If it's an ObjectId error, return a more helpful message
    if (error instanceof Error && error.message.includes("ObjectId")) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 },
    );
  }
}

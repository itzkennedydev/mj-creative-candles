import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "~/lib/auth";
import clientPromise from "~/lib/mongodb";
import { cacheInvalidation } from "~/lib/cache";

interface AdminSettings {
  taxRate: number;
  shippingEnabled: boolean;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
  pickupLocation: string;
  burndownUrgentThreshold: number;
  burndownCriticalThreshold: number;
}

// GET /api/admin/settings - Get admin settings
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const settingsCollection = db.collection<
      AdminSettings & { _id?: string; updatedAt?: Date }
    >("admin_settings");

    // Get the settings document (there should only be one)
    const settings = await settingsCollection.findOne({});

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: AdminSettings = {
        taxRate: 8.5,
        shippingEnabled: true,
        pickupOnly: false,
        freeShippingThreshold: 50,
        shippingCost: 9.99,
        pickupInstructions:
          "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
        pickupLocation: "415 13th St, Moline, IL 61265",
        burndownUrgentThreshold: 120, // 5 days (aligned with scoring)
        burndownCriticalThreshold: 168, // 7 days (aligned with scoring)
      };
      return NextResponse.json({ settings: defaultSettings });
    }

    // Remove MongoDB _id from response
    const { _id, ...settingsWithoutId } = settings;
    return NextResponse.json({ settings: settingsWithoutId });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/settings - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AdminSettings;

    // Validate settings
    if (
      typeof body.taxRate !== "number" ||
      body.taxRate < 0 ||
      body.taxRate > 100
    ) {
      return NextResponse.json(
        { error: "Invalid tax rate (must be between 0 and 100)" },
        { status: 400 },
      );
    }

    if (typeof body.pickupOnly !== "boolean") {
      return NextResponse.json(
        { error: "pickupOnly must be a boolean" },
        { status: 400 },
      );
    }

    if (typeof body.shippingCost !== "number" || body.shippingCost < 0) {
      return NextResponse.json(
        { error: "Shipping cost must be a non-negative number" },
        { status: 400 },
      );
    }

    if (
      typeof body.freeShippingThreshold !== "number" ||
      body.freeShippingThreshold < 0
    ) {
      return NextResponse.json(
        { error: "Free shipping threshold must be a non-negative number" },
        { status: 400 },
      );
    }

    if (
      typeof body.burndownUrgentThreshold !== "number" ||
      body.burndownUrgentThreshold < 1
    ) {
      return NextResponse.json(
        { error: "Burndown urgent threshold must be at least 1 hour" },
        { status: 400 },
      );
    }

    if (
      typeof body.burndownCriticalThreshold !== "number" ||
      body.burndownCriticalThreshold < 1
    ) {
      return NextResponse.json(
        { error: "Burndown critical threshold must be at least 1 hour" },
        { status: 400 },
      );
    }

    if (body.burndownUrgentThreshold >= body.burndownCriticalThreshold) {
      return NextResponse.json(
        { error: "Urgent threshold must be less than critical threshold" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const settingsCollection = db.collection<
      AdminSettings & { updatedAt: Date }
    >("admin_settings");

    // Upsert settings (update if exists, insert if not)
    const settingsToSave = {
      ...body,
      updatedAt: new Date(),
    };

    await settingsCollection.updateOne(
      {},
      { $set: settingsToSave },
      { upsert: true },
    );

    // Invalidate settings cache
    cacheInvalidation.settings();

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      settings: body,
    });
  } catch (error) {
    console.error("Error saving admin settings:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}

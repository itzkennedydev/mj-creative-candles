import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';

interface PublicSettings {
  taxRate: number;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
  pickupLocation: string;
}

// GET /api/settings - Get public settings (for checkout)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const settingsCollection = db.collection<PublicSettings & { _id?: string; updatedAt?: Date }>('admin_settings');

    // Get the settings document (there should only be one)
    const settings = await settingsCollection.findOne({});

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: PublicSettings = {
        taxRate: 8.5,
        pickupOnly: false,
        freeShippingThreshold: 50,
        shippingCost: 9.99,
        pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
        pickupLocation: "415 13th St, Moline, IL 61265",
      };
      return NextResponse.json({ settings: defaultSettings });
    }

    // Return only public settings (exclude admin-only fields)
    const publicSettings: PublicSettings = {
      taxRate: settings.taxRate,
      pickupOnly: settings.pickupOnly,
      freeShippingThreshold: settings.freeShippingThreshold,
      shippingCost: settings.shippingCost,
      pickupInstructions: settings.pickupInstructions,
      pickupLocation: settings.pickupLocation || "415 13th St, Moline, IL 61265",
    };

    return NextResponse.json(
      { settings: publicSettings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching public settings:', error);
    // Return default settings on error
    const defaultSettings: PublicSettings = {
      taxRate: 8.5,
      pickupOnly: false,
      freeShippingThreshold: 50,
      shippingCost: 9.99,
      pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
      pickupLocation: "415 13th St, Moline, IL 61265",
    };
    return NextResponse.json(
      { settings: defaultSettings },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  }
}




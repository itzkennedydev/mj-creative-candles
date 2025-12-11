import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate request - only admin can migrate databases
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    
    const migrationResults = {
      verificationCodes: { migrated: 0, errors: [] as string[] },
      orders: { migrated: 0, errors: [] as string[] },
      cleanup: { dropped: false, error: null as string | null }
    };

    // 1. Migrate verification codes from stitchplease to stitch_orders
    try {
      const sourceDb = client.db('mj-creative-candles');
      const targetDb = client.db('mj-creative-candles');
      
      const sourceCollection = sourceDb.collection('verification_codes');
      const targetCollection = targetDb.collection('verification_codes');
      
      const verificationCodes = await sourceCollection.find({}).toArray();
      
      if (verificationCodes.length > 0) {
        // Insert into target database
        const insertResult = await targetCollection.insertMany(verificationCodes);
        migrationResults.verificationCodes.migrated = insertResult.insertedCount || 0;
        
        console.log(`✅ Migrated ${migrationResults.verificationCodes.migrated} verification codes`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      migrationResults.verificationCodes.errors.push(errorMsg);
      console.error('Error migrating verification codes:', error);
    }

    // 2. Migrate any remaining orders from stitchplease to stitch_orders
    try {
      const sourceDb = client.db('mj-creative-candles');
      const targetDb = client.db('mj-creative-candles');
      
      const sourceCollection = sourceDb.collection('orders');
      const targetCollection = targetDb.collection('orders');
      
      const orders = await sourceCollection.find({}).toArray();
      
      if (orders.length > 0) {
        // Transform orders to match stitch_orders schema
        const transformedOrders = orders.map(order => ({
          orderNumber: order.orderNumber || `SP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          customer: {
            firstName: order.customerName?.split(' ')[0] || 'Unknown',
            lastName: order.customerName?.split(' ').slice(1).join(' ') || 'Customer',
            email: order.customerEmail || 'unknown@example.com',
            phone: order.customerPhone || ''
          },
          shipping: {
            street: 'Pickup Only',
            city: 'Pickup Location',
            state: 'Local',
            zipCode: '00000',
            country: 'United States'
          },
          items: order.items?.map((item: any) => ({
            productId: item.productId || '',
            productName: item.productName || 'Unknown Product',
            productPrice: item.price || item.totalAmount || 0,
            quantity: item.quantity || 1,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })) || [],
          subtotal: order.totalAmount || 0,
          tax: (order.totalAmount || 0) * 0.085,
          shippingCost: 0,
          total: order.totalAmount || 0,
          status: order.status || 'pending',
          paymentMethod: 'card' as const,
          notes: order.notes,
          createdAt: order.createdAt || new Date(),
          updatedAt: order.updatedAt || new Date()
        }));
        
        const insertResult = await targetCollection.insertMany(transformedOrders);
        migrationResults.orders.migrated = insertResult.insertedCount || 0;
        
        console.log(`✅ Migrated ${migrationResults.orders.migrated} orders`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      migrationResults.orders.errors.push(errorMsg);
      console.error('Error migrating orders:', error);
    }

    // 3. Drop the unused stitchplease database
    try {
      await client.db('mj-creative-candles').dropDatabase();
      migrationResults.cleanup.dropped = true;
      console.log('✅ Dropped unused stitchplease database');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      migrationResults.cleanup.error = errorMsg;
      console.error('Error dropping stitchplease database:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Database consolidation completed',
      results: migrationResults
    });

  } catch (error) {
    console.error('Error during database consolidation:', error);
    return NextResponse.json(
      { error: 'Failed to consolidate databases' },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what would be migrated
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
      verificationCodes: { count: 0 },
      orders: { count: 0 },
      databases: { stitchplease: false, stitch_orders: true }
    };

    // Check if stitchplease database exists and what it contains
    try {
      const stitchpleaseDb = client.db('mj-creative-candles');
      const adminDb = client.db('admin');
      
      // List databases to check if stitchplease exists
      const databases = await adminDb.admin().listDatabases();
      const dbNames = databases.databases.map(db => db.name);
      
      if (dbNames.includes('stitchplease')) {
        preview.databases.stitchplease = true;
        
        // Count verification codes
        const verificationCodesCollection = stitchpleaseDb.collection('verification_codes');
        preview.verificationCodes.count = await verificationCodesCollection.countDocuments();
        
        // Count orders
        const ordersCollection = stitchpleaseDb.collection('orders');
        preview.orders.count = await ordersCollection.countDocuments();
      }
    } catch (error) {
      console.error('Error checking stitchplease database:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Database consolidation preview',
      preview
    });

  } catch (error) {
    console.error('Error previewing database consolidation:', error);
    return NextResponse.json(
      { error: 'Failed to preview database consolidation' },
      { status: 500 }
    );
  }
}

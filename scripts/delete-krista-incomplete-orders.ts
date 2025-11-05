/**
 * Script to delete incomplete orders for Krista Hutton
 * Run with: npx tsx scripts/delete-krista-incomplete-orders.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { ObjectId } from 'mongodb';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

async function deleteKristaIncompleteOrders() {
  let client: MongoClient | null = null;
  
  try {
    console.log('🔍 Connecting to database...');
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');

    // Order numbers to delete
    const orderNumbers = [
      'SP-1762359176200-SNKE',
      'SP-1762358739756-SIN8'
    ];

    console.log('🔍 Searching for orders...');
    const orders = await ordersCollection.find({
      orderNumber: { $in: orderNumbers }
    }).toArray();

    if (orders.length === 0) {
      console.log('✅ No orders found with those order numbers.');
      return;
    }

    console.log(`\n📋 Found ${orders.length} order(s):`);
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ${order.orderNumber || order._id}`);
      console.log(`     Customer: ${order.customer.firstName} ${order.customer.lastName}`);
      console.log(`     Email: ${order.customer.email}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Created: ${order.createdAt}`);
      console.log('');
    });

    // Delete the orders
    const orderIds = orders.map(order => order._id).filter(Boolean) as ObjectId[];
    const deleteResult = await ordersCollection.deleteMany({
      _id: { $in: orderIds }
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} order(s)`);
    console.log(`   Deleted order numbers: ${orders.map(o => o.orderNumber).join(', ')}`);
    console.log(`   Deleted order IDs: ${orderIds.map(id => id.toString()).join(', ')}`);

  } catch (error) {
    console.error('❌ Error deleting orders:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

// Run the script
deleteKristaIncompleteOrders();


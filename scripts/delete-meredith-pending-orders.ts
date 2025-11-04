/**
 * Script to delete pending orders for Meredith
 * Run with: npx tsx scripts/delete-meredith-pending-orders.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { ObjectId } from 'mongodb';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

async function deleteMeredithPendingOrders() {
  let client: MongoClient | null = null;
  
  try {
    console.log('🔍 Connecting to database...');
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');

    // Find all Meredith orders first
    console.log('🔍 Searching for Meredith orders...');
    const allMeredithOrders = await ordersCollection.find({
      'customer.firstName': { $regex: /^meredith$/i }
    }).toArray();

    if (allMeredithOrders.length === 0) {
      console.log('✅ No Meredith orders found.');
      return;
    }

    console.log(`\n📋 Found ${allMeredithOrders.length} order(s) for Meredith:`);
    allMeredithOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ${order.orderNumber || order._id}`);
      console.log(`     Customer: ${order.customer.firstName} ${order.customer.lastName}`);
      console.log(`     Email: ${order.customer.email}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Created: ${order.createdAt}`);
      console.log('');
    });

    // Find pending Meredith orders
    const pendingMeredithOrders = allMeredithOrders.filter(order => order.status === 'pending');

    if (pendingMeredithOrders.length === 0) {
      console.log('✅ No pending Meredith orders found.');
      return;
    }

    console.log(`\n🗑️  Found ${pendingMeredithOrders.length} pending order(s) for Meredith:`);
    pendingMeredithOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ${order.orderNumber || order._id}`);
      console.log(`     Customer: ${order.customer.firstName} ${order.customer.lastName}`);
      console.log(`     Email: ${order.customer.email}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Created: ${order.createdAt}`);
      console.log('');
    });

    // Delete the pending orders
    const orderIds = pendingMeredithOrders.map(order => order._id).filter(Boolean) as ObjectId[];
    const deleteResult = await ordersCollection.deleteMany({
      _id: { $in: orderIds },
      status: 'pending'
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} pending order(s) for Meredith`);
    console.log(`   Deleted order IDs: ${orderIds.map(id => id.toString()).join(', ')}`);

  } catch (error) {
    console.error('❌ Error deleting Meredith pending orders:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

// Run the script
deleteMeredithPendingOrders();


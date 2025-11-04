/**
 * Script to delete orders for Kennedy M
 * Run with: npx tsx scripts/delete-kennedy-m-orders.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { ObjectId } from 'mongodb';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

async function deleteKennedyMOrders() {
  let client: MongoClient | null = null;
  
  try {
    console.log('🔍 Connecting to database...');
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');

    // Find orders where firstName is "Kennedy" and lastName starts with "M"
    console.log('🔍 Searching for Kennedy M orders...');
    const kennedyMOrders = await ordersCollection.find({
      'customer.firstName': { $regex: /^kennedy$/i },
      'customer.lastName': { $regex: /^m/i }
    }).toArray();

    if (kennedyMOrders.length === 0) {
      console.log('✅ No Kennedy M orders found.');
      return;
    }

    console.log(`\n📋 Found ${kennedyMOrders.length} order(s) for Kennedy M:`);
    kennedyMOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. Order ${order.orderNumber || order._id}`);
      console.log(`     Customer: ${order.customer.firstName} ${order.customer.lastName}`);
      console.log(`     Email: ${order.customer.email}`);
      console.log(`     Status: ${order.status}`);
      console.log(`     Total: $${order.total}`);
      console.log(`     Created: ${order.createdAt}`);
      console.log('');
    });

    // Delete the orders
    const orderIds = kennedyMOrders.map(order => order._id).filter(Boolean) as ObjectId[];
    const deleteResult = await ordersCollection.deleteMany({
      _id: { $in: orderIds }
    });

    console.log(`\n✅ Successfully deleted ${deleteResult.deletedCount} order(s) for Kennedy M`);
    console.log(`   Deleted order IDs: ${orderIds.map(id => id.toString()).join(', ')}`);

  } catch (error) {
    console.error('❌ Error deleting Kennedy M orders:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

// Run the script
deleteKennedyMOrders();


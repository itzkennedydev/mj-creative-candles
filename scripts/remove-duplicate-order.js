// Script to remove a duplicate order
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function removeDuplicateOrder(orderId) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');

    // First, verify the order exists and show details
    const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      console.error(`❌ Order with ID ${orderId} not found`);
      return;
    }

    console.log('📋 Order to be deleted:');
    console.log(`   ID: ${order._id}`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customer?.firstName} ${order.customer?.lastName}`);
    console.log(`   Email: ${order.customer?.email}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: $${order.total?.toFixed(2) || '0.00'}`);
    console.log(`   Created: ${order.createdAt ? new Date(order.createdAt).toISOString() : 'N/A'}`);
    console.log('');

    // Delete the order
    const result = await ordersCollection.deleteOne({ _id: new ObjectId(orderId) });

    if (result.deletedCount === 1) {
      console.log(`✅ Successfully deleted order ${order.orderNumber} (${orderId})`);
    } else {
      console.error(`❌ Failed to delete order ${orderId}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

// Get order ID from command line argument
const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ Please provide an order ID to delete');
  console.log('Usage: node scripts/remove-duplicate-order.js <orderId>');
  process.exit(1);
}

removeDuplicateOrder(orderId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


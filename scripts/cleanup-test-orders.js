#!/usr/bin/env node

// Script to clean up Kennedy test orders from the database
import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function cleanupTestOrders() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');
    
    // Find Kennedy test orders
    const testOrdersQuery = {
      $or: [
        { 'customer.firstName': { $regex: /kennedy/i } },
        { 'customer.lastName': { $regex: /kennedy/i } },
        { 'customer.email': { $regex: /kennedy/i } },
        { 'customer.email': { $regex: /test/i } },
        { 'customer.email': { $regex: /example\.com/i } },
        { orderNumber: { $regex: /test/i } }
      ]
    };
    
    // First, let's see what we're about to delete
    const testOrders = await ordersCollection.find(testOrdersQuery).toArray();
    
    if (testOrders.length === 0) {
      console.log('✅ No test orders found to delete');
      return;
    }
    
    console.log(`🔍 Found ${testOrders.length} test orders:`);
    testOrders.forEach(order => {
      console.log(`  - Order ${order.orderNumber}: ${order.customer.firstName} ${order.customer.lastName} (${order.customer.email}) - $${order.total}`);
    });
    
    // Delete the test orders
    const deleteResult = await ordersCollection.deleteMany(testOrdersQuery);
    
    console.log(`🗑️ Successfully deleted ${deleteResult.deletedCount} test orders`);
    
  } catch (error) {
    console.error('❌ Error cleaning up test orders:', error);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupTestOrders()
  .then(() => {
    console.log('✅ Cleanup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });

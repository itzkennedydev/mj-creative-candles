import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

// TypeScript type assertion - we know MONGODB_URI is a string after the check above
const MONGODB_URI_STRING = /** @type {string} */ (MONGODB_URI);

const ORDER_NUMBERS = [
  'SP-1761878206525-TLVF',
  'SP-1761877820794-K1QS'
];

const CUSTOMER_NAME = 'Lindsey Johanson';

async function main() {
  const client = new MongoClient(MONGODB_URI_STRING);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');
    
    // Check for Lindsey Johanson orders
    console.log('\n📋 Checking for Lindsey Johanson orders...');
    const lindseyOrders = await ordersCollection.find({
      $or: [
        { orderNumber: { $in: ORDER_NUMBERS } },
        { 
          $or: [
            { 'customer.firstName': { $regex: /lindsey/i } },
            { 'customer.lastName': { $regex: /johanson/i } }
          ]
        }
      ]
    }).toArray();
    
    console.log(`\nFound ${lindseyOrders.length} Lindsey Johanson order(s):`);
    lindseyOrders.forEach(order => {
      console.log(`  - ${order.orderNumber} | ${order.customer.firstName} ${order.customer.lastName} | $${order.total} | ${order.status}`);
    });
    
    // Check which specific order numbers exist
    const existingOrderNumbers = lindseyOrders.map(o => o.orderNumber).filter(Boolean);
    const missingOrderNumbers = ORDER_NUMBERS.filter(num => !existingOrderNumbers.includes(num));
    
    if (missingOrderNumbers.length > 0) {
      console.log(`\n⚠️  Missing order numbers: ${missingOrderNumbers.join(', ')}`);
      console.log('   These orders may have been deleted. Check backups or logs for recovery.');
    } else {
      console.log('\n✅ All Lindsey Johanson orders found!');
    }
    
    // Check for Kennedy test orders
    console.log('\n🔍 Checking for Kennedy test orders...');
    const kennedyOrders = await ordersCollection.find({
      $or: [
        { 'customer.firstName': { $regex: /kennedy/i } },
        { 'customer.lastName': { $regex: /kennedy/i } },
        { 'customer.email': { $regex: /kennedy/i } },
        { 'customer.email': { $regex: /test/i } },
        { 'customer.email': { $regex: /example\.com/i } },
        { orderNumber: { $regex: /test/i } }
      ]
    }).toArray();
    
    if (kennedyOrders.length > 0) {
      console.log(`\n⚠️  Found ${kennedyOrders.length} Kennedy/test order(s):`);
      kennedyOrders.forEach(order => {
        console.log(`  - ${order.orderNumber} | ${order.customer.firstName} ${order.customer.lastName} | ${order.customer.email} | $${order.total}`);
      });
      
      console.log('\n🗑️  Deleting Kennedy test orders...');
      const deleteResult = await ordersCollection.deleteMany({
        _id: { $in: kennedyOrders.map(order => order._id) }
      });
      
      console.log(`✅ Deleted ${deleteResult.deletedCount} Kennedy test order(s)`);
    } else {
      console.log('✅ No Kennedy test orders found');
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   - Lindsey Johanson orders: ${lindseyOrders.length}`);
    console.log(`   - Missing order numbers: ${missingOrderNumbers.length > 0 ? missingOrderNumbers.join(', ') : 'None'}`);
    console.log(`   - Kennedy test orders deleted: ${kennedyOrders.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Database connection closed');
  }
}

main().catch(console.error);


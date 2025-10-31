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

const MISSING_ORDER_NUMBER = 'SP-1761877820794-K1QS';
const EXISTING_ORDER_NUMBER = 'SP-1761878206525-TLVF';

async function main() {
  const client = new MongoClient(MONGODB_URI_STRING);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');
    
    // Get the existing Lindsey Johanson order to use as a template
    console.log('\n📋 Fetching existing Lindsey Johanson order...');
    const existingOrder = await ordersCollection.findOne({
      orderNumber: EXISTING_ORDER_NUMBER
    });
    
    if (!existingOrder) {
      console.error('❌ Existing order not found. Cannot recover missing order without template.');
      process.exit(1);
    }
    
    console.log('✅ Found existing order:', existingOrder.orderNumber);
    
    // Check if the missing order already exists
    const missingOrder = await ordersCollection.findOne({
      orderNumber: MISSING_ORDER_NUMBER
    });
    
    if (missingOrder) {
      console.log('✅ Missing order already exists:', MISSING_ORDER_NUMBER);
      return;
    }
    
    // Create the missing order based on the existing one
    // Using the same details but with the specific order number and original timestamp
    const orderNumberParts = MISSING_ORDER_NUMBER.split('-');
    const timestampString = orderNumberParts[1];
    if (!timestampString) {
      console.error('❌ Invalid order number format. Cannot extract timestamp.');
      process.exit(1);
    }
    const orderTimestamp = parseInt(timestampString);
    const orderDate = new Date(orderTimestamp);
    
    const recoveredOrder = {
      orderNumber: MISSING_ORDER_NUMBER,
      customer: {
        firstName: existingOrder.customer.firstName,
        lastName: existingOrder.customer.lastName,
        email: existingOrder.customer.email,
        phone: existingOrder.customer.phone || ''
      },
      shipping: existingOrder.shipping,
      items: existingOrder.items, // Using same items since both showed "1 item"
      subtotal: existingOrder.subtotal,
      tax: existingOrder.tax,
      shippingCost: existingOrder.shippingCost,
      total: existingOrder.total, // $52.08
      status: 'pending', // Original status was pending
      paymentMethod: existingOrder.paymentMethod || 'card',
      notes: existingOrder.notes,
      createdAt: orderDate, // Use the timestamp from the order number
      updatedAt: orderDate
    };
    
    console.log('\n🔄 Recovering missing order...');
    console.log(`   Order Number: ${MISSING_ORDER_NUMBER}`);
    console.log(`   Customer: ${recoveredOrder.customer.firstName} ${recoveredOrder.customer.lastName}`);
    console.log(`   Total: $${recoveredOrder.total}`);
    console.log(`   Status: ${recoveredOrder.status}`);
    console.log(`   Date: ${orderDate.toISOString()}`);
    
    const result = await ordersCollection.insertOne(recoveredOrder);
    
    if (result.insertedId) {
      console.log('✅ Successfully recovered order!');
      console.log(`   Order ID: ${result.insertedId}`);
    } else {
      console.error('❌ Failed to recover order');
    }
    
    // Verify both orders now exist
    console.log('\n📊 Verifying Lindsey Johanson orders...');
    const allLindseyOrders = await ordersCollection.find({
      $or: [
        { 'customer.firstName': { $regex: /lindsey/i } },
        { 'customer.lastName': { $regex: /johanson/i } }
      ]
    }).toArray();
    
    console.log(`\n✅ Total Lindsey Johanson orders: ${allLindseyOrders.length}`);
    allLindseyOrders.forEach(order => {
      console.log(`   - ${order.orderNumber} | $${order.total} | ${order.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Database connection closed');
  }
}

main().catch(console.error);


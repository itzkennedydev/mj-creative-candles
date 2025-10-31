// Script to examine orders for a specific customer
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function examineCustomerOrders(customerName) {
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

    // Search for orders by customer name
    const nameParts = customerName.toLowerCase().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[1] || '';

    console.log(`🔍 Searching for orders for: ${customerName}\n`);

    // Find orders matching first or last name
    const query = {
      $or: [
        { 'customer.firstName': { $regex: firstName, $options: 'i' } },
        { 'customer.lastName': { $regex: lastName || firstName, $options: 'i' } },
      ]
    };

    if (lastName) {
      query.$or.push(
        { 'customer.lastName': { $regex: lastName, $options: 'i' } }
      );
    }

    const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray();

    console.log(`📊 Found ${orders.length} order(s)\n`);

    if (orders.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    // Group orders by customer email to find duplicates
    const ordersByEmail = {};
    const ordersByPhone = {};
    const ordersByOrderNumber = {};

    orders.forEach(order => {
      const email = order.customer?.email?.toLowerCase() || 'no-email';
      const phone = order.customer?.phone || 'no-phone';
      const orderNumber = order.orderNumber || 'no-number';

      if (!ordersByEmail[email]) ordersByEmail[email] = [];
      ordersByEmail[email].push(order);

      if (!ordersByPhone[phone]) ordersByPhone[phone] = [];
      ordersByPhone[phone].push(order);

      if (!ordersByOrderNumber[orderNumber]) ordersByOrderNumber[orderNumber] = [];
      ordersByOrderNumber[orderNumber].push(order);
    });

    // Display orders
    orders.forEach((order, index) => {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Order #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${order._id}`);
      console.log(`Order Number: ${order.orderNumber || 'N/A'}`);
      console.log(`Customer: ${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`);
      console.log(`Email: ${order.customer?.email || 'N/A'}`);
      console.log(`Phone: ${order.customer?.phone || 'N/A'}`);
      console.log(`Total: $${order.total?.toFixed(2) || '0.00'}`);
      console.log(`Status: ${order.status || 'N/A'}`);
      console.log(`Created: ${order.createdAt ? new Date(order.createdAt).toISOString() : 'N/A'}`);
      console.log(`Updated: ${order.updatedAt ? new Date(order.updatedAt).toISOString() : 'N/A'}`);
      console.log(`Items: ${order.items?.length || 0}`);
      
      // Payment information
      console.log(`Payment Info:`);
      console.log(`  - Payment Method: ${order.paymentMethod || 'N/A'}`);
      console.log(`  - Paid At: ${order.paidAt ? new Date(order.paidAt).toISOString() : 'Not paid'}`);
      console.log(`  - Stripe Session ID: ${order.stripeSessionId || 'N/A'}`);
      console.log(`  - Payment Intent ID: ${order.paymentIntentId || 'N/A'}`);
      console.log(`  - Stripe Subtotal: ${order.stripeSubtotal ? '$' + order.stripeSubtotal.toFixed(2) : 'N/A'}`);
      console.log(`  - Stripe Tax: ${order.stripeTax ? '$' + order.stripeTax.toFixed(2) : 'N/A'}`);
      console.log(`  - Stripe Total: ${order.stripeTotal ? '$' + order.stripeTotal.toFixed(2) : 'N/A'}`);
      
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, i) => {
          console.log(`  ${i + 1}. ${item.productName} - Qty: ${item.quantity} - $${(item.productPrice || 0).toFixed(2)}`);
        });
      }
      console.log('');
    });

    // Check for duplicates
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DUPLICATE ANALYSIS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Check for orders with same email
    Object.keys(ordersByEmail).forEach(email => {
      if (ordersByEmail[email].length > 1 && email !== 'no-email') {
        console.log(`⚠️  Found ${ordersByEmail[email].length} orders with email: ${email}`);
        ordersByEmail[email].forEach(order => {
          console.log(`   - Order ID: ${order._id}, Number: ${order.orderNumber}, Created: ${new Date(order.createdAt).toISOString()}`);
        });
        console.log('');
      }
    });

    // Check for orders with same phone
    Object.keys(ordersByPhone).forEach(phone => {
      if (ordersByPhone[phone].length > 1 && phone !== 'no-phone') {
        console.log(`⚠️  Found ${ordersByPhone[phone].length} orders with phone: ${phone}`);
        ordersByPhone[phone].forEach(order => {
          console.log(`   - Order ID: ${order._id}, Number: ${order.orderNumber}, Created: ${new Date(order.createdAt).toISOString()}`);
        });
        console.log('');
      }
    });

    // Check for orders with same order number
    Object.keys(ordersByOrderNumber).forEach(orderNumber => {
      if (ordersByOrderNumber[orderNumber].length > 1 && orderNumber !== 'no-number') {
        console.log(`⚠️  Found ${ordersByOrderNumber[orderNumber].length} orders with order number: ${orderNumber}`);
        ordersByOrderNumber[orderNumber].forEach(order => {
          console.log(`   - Order ID: ${order._id}, Created: ${new Date(order.createdAt).toISOString()}`);
        });
        console.log('');
      }
    });

    // Check time difference between orders
    if (orders.length >= 2) {
      const sortedOrders = orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      for (let i = 1; i < sortedOrders.length; i++) {
        const timeDiff = new Date(sortedOrders[i].createdAt) - new Date(sortedOrders[i-1].createdAt);
        const secondsDiff = timeDiff / 1000;
        
        if (secondsDiff < 30) {
          console.log(`⚠️  SUSPICIOUS: Two orders created within ${secondsDiff.toFixed(2)} seconds of each other:`);
          console.log(`   - Order 1: ${sortedOrders[i-1]._id} (${new Date(sortedOrders[i-1].createdAt).toISOString()})`);
          console.log(`   - Order 2: ${sortedOrders[i]._id} (${new Date(sortedOrders[i].createdAt).toISOString()})`);
          console.log('');
        }
      }
    }

    // Check for orders with identical totals and items
    if (orders.length >= 2) {
      for (let i = 0; i < orders.length; i++) {
        for (let j = i + 1; j < orders.length; j++) {
          const order1 = orders[i];
          const order2 = orders[j];
          
          if (order1.total === order2.total) {
            const items1 = JSON.stringify(order1.items?.map(i => ({ name: i.productName, qty: i.quantity, price: i.productPrice })).sort());
            const items2 = JSON.stringify(order2.items?.map(i => ({ name: i.productName, qty: i.quantity, price: i.productPrice })).sort());
            
            if (items1 === items2) {
              console.log(`⚠️  POTENTIAL DUPLICATE: Orders have identical totals and items`);
              console.log(`   - Order 1: ${order1._id} (${order1.orderNumber}) - Created: ${new Date(order1.createdAt).toISOString()}`);
              console.log(`   - Order 2: ${order2._id} (${order2.orderNumber}) - Created: ${new Date(order2.createdAt).toISOString()}`);
              console.log(`   - Total: $${order1.total?.toFixed(2)}`);
              console.log('');
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('✅ Connection closed');
  }
}

// Get customer name from command line argument
const customerName = process.argv[2] || 'Lindsey Johnson';

examineCustomerOrders(customerName)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


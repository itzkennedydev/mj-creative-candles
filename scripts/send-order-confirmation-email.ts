import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { sendOrderConfirmationEmail } from '../src/lib/email-service';

config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const ORDER_NUMBER = 'SP-1762539791774-TACH';

async function sendConfirmationEmail() {
  let client: MongoClient | null = null;

  try {
    console.log('🔍 Connecting to database...');
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();

    const db = client.db('stitch_orders');
    const ordersCollection = db.collection('orders');

    console.log(`🔍 Searching for order ${ORDER_NUMBER}...`);
    const order = await ordersCollection.findOne({
      orderNumber: ORDER_NUMBER
    });

    if (!order) {
      console.log(`❌ Order ${ORDER_NUMBER} not found.`);
      return;
    }

    console.log(`\n📋 Found order:`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Customer: ${order.customer.firstName} ${order.customer.lastName}`);
    console.log(`   Email: ${order.customer.email}`);
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: $${order.total}`);
    console.log('');

    if (order.status !== 'paid') {
      console.log(`⚠️  Order status is '${order.status}', not 'paid'. Email will not be sent for security reasons.`);
      return;
    }

    console.log('📧 Sending confirmation email...');
    const emailSent = await sendOrderConfirmationEmail(order as any);

    if (emailSent) {
      console.log(`\n✅ Successfully sent confirmation email for order ${ORDER_NUMBER}`);
      console.log(`   Customer email: ${order.customer.email}`);
      console.log(`   Admin notification also sent`);
    } else {
      console.log(`\n❌ Failed to send confirmation email for order ${ORDER_NUMBER}`);
    }

  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

sendConfirmationEmail();



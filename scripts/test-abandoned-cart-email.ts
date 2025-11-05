/**
 * Script to test abandoned cart email
 * Run with: npx tsx scripts/test-abandoned-cart-email.ts
 */

import { config } from 'dotenv';
import { sendAbandonedCartEmail } from '../src/lib/email-service';

// Load environment variables
config({ path: '.env.local' });

async function testAbandonedCartEmail() {
  try {
    console.log('🧪 Testing abandoned cart email...');
    
    const testData = {
      customerEmail: 'itskennedy.dev@gmail.com',
      customerName: 'Kennedy',
      checkoutUrl: 'https://checkout.stripe.com/test-session-url',
      items: [
        {
          productName: 'Moline Beanie',
          quantity: 1,
          productPrice: 25.00,
          selectedSize: 'One Size',
          selectedColor: 'Black',
        },
        {
          productName: 'Custom T-Shirt',
          quantity: 2,
          productPrice: 30.00,
          selectedSize: 'Large',
          selectedColor: 'Navy',
        },
      ],
      total: 85.00,
      emailNumber: 1, // Test with email #1
    };
    
    console.log('📧 Sending test email to:', testData.customerEmail);
    console.log('📦 Items:', testData.items);
    console.log('💰 Total:', testData.total);
    
    const result = await sendAbandonedCartEmail(testData);
    
    if (result) {
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox at:', testData.customerEmail);
    } else {
      console.error('❌ Failed to send test email');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    process.exit(1);
  }
}

// Run the test
testAbandonedCartEmail();


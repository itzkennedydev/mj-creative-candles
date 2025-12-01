/**
 * Script to check current beanie products in database
 * Run with: npx tsx scripts/check-beanies.ts
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function checkBeanies() {
  try {
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find all beanie-related products
    const beanies = await productsCollection.find({
      $or: [
        { name: { $regex: /beanie/i } },
        { category: 'Hats' }
      ]
    }).toArray();

    console.log(`Found ${beanies.length} beanie/hat product(s):\n`);

    for (const beanie of beanies) {
      console.log('─'.repeat(60));
      console.log(`📦 ${beanie.name}`);
      console.log(`   ID: ${beanie._id}`);
      console.log(`   Category: ${beanie.category || 'N/A'}`);
      console.log(`   Shop Type: ${beanie.shopType || 'N/A'}`);
      console.log(`   School: ${beanie.school || 'N/A'}`);
      console.log(`   Price: $${beanie.price || 'N/A'}`);
      console.log(`   Primary Image: ${beanie.image || 'N/A'}`);
      console.log(`   Colors: ${beanie.colors?.join(', ') || 'None'}`);
      console.log(`   Sizes: ${beanie.sizes?.join(', ') || 'None'}`);
      console.log(`   In Stock: ${beanie.inStock !== false ? 'Yes' : 'No'}`);
      
      if (beanie.images && beanie.images.length > 0) {
        console.log(`   Additional Images:`);
        beanie.images.forEach((img: any, i: number) => {
          const path = typeof img === 'string' ? img : img.dataUri || img.filename;
          console.log(`     ${i + 1}. ${path}`);
        });
      }
    }
    console.log('─'.repeat(60));

    await client.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkBeanies()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


/**
 * Script to list ALL products in database
 * Run with: npx tsx scripts/list-all-products.ts
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function listAllProducts() {
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

    const products = await productsCollection.find({}).sort({ shopType: 1, name: 1 }).toArray();

    console.log(`Found ${products.length} total product(s):\n`);

    // Group by shop type
    const byShopType: Record<string, any[]> = {};
    for (const product of products) {
      const type = product.shopType || 'unknown';
      if (!byShopType[type]) byShopType[type] = [];
      byShopType[type].push(product);
    }

    for (const [shopType, prods] of Object.entries(byShopType)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📁 ${shopType.toUpperCase()} (${prods.length} products)`);
      console.log('='.repeat(60));
      
      for (const p of prods) {
        console.log(`\n📦 ${p.name}`);
        console.log(`   ID: ${p._id}`);
        console.log(`   Category: ${p.category || 'N/A'}`);
        console.log(`   School: ${p.school || 'N/A'}`);
        console.log(`   Price: $${p.price || 'N/A'}`);
        console.log(`   Primary Image: ${p.image || 'N/A'}`);
        console.log(`   In Stock: ${p.inStock !== false ? 'Yes' : 'No'}`);
        if (p.colors?.length) {
          console.log(`   Colors: ${p.colors.join(', ')}`);
        }
        if (p.images?.length) {
          console.log(`   Additional Images: ${p.images.length}`);
          p.images.forEach((img: any, i: number) => {
            const path = typeof img === 'string' ? img : img.dataUri || img.filename;
            console.log(`     ${i + 1}. ${path}`);
          });
        }
      }
    }

    await client.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

listAllProducts()
  .then(() => {
    console.log('\n\n✅ Listing completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


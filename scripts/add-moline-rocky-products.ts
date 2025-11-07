/**
 * Script to add Moline Black Beanie and Rocky Hoodie to the store
 * Run with: npx tsx scripts/add-moline-rocky-products.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

interface ProductDocument {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  shopType?: 'spirit-wear' | 'regular-shop';
  school?: 'moline' | 'united-township';
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
}

async function addProducts() {
  let client: MongoClient | null = null;
  
  try {
    console.log('🔍 Connecting to database...');
    client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');

    // Check if products already exist
    const existingMolineBlack = await productsCollection.findOne({ 
      name: 'Moline Black Beanie',
      school: 'moline'
    });
    
    const existingRockyHoodie = await productsCollection.findOne({ 
      name: 'Rocky Hoodie',
      school: 'moline'
    });

    const productsToAdd: ProductDocument[] = [];

    // Add Moline Black Beanie if it doesn't exist
    if (!existingMolineBlack) {
      productsToAdd.push({
        name: 'Moline Black Beanie',
        description: 'Show your Moline Maroons pride with our premium beanie! Features the classic M logo in black. Perfect for chilly game nights and campus spirit events.',
        price: 20.00,
        image: '/MolineBlack.jpeg',
        category: 'Headwear',
        shopType: 'spirit-wear',
        school: 'moline',
        inStock: true,
        sizes: ['One Size'],
        colors: ['Black']
      });
      console.log('✅ Prepared Moline Black Beanie for addition');
    } else {
      console.log('⚠️  Moline Black Beanie already exists, skipping...');
    }

    // Add Rocky Hoodie if it doesn't exist
    if (!existingRockyHoodie) {
      productsToAdd.push({
        name: 'Rocky Hoodie',
        description: 'Stay warm while supporting Moline! Our cozy 50-50 cotton poly blend black hoodie features the Rocky design. Ideal for chilly game nights and campus spirit events.',
        price: 35.00,
        image: '/RockyHoodie.jpeg',
        category: 'Apparel',
        shopType: 'spirit-wear',
        school: 'moline',
        inStock: true,
        sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
        colors: ['Black']
      });
      console.log('✅ Prepared Rocky Hoodie for addition');
    } else {
      console.log('⚠️  Rocky Hoodie already exists, skipping...');
    }

    if (productsToAdd.length === 0) {
      console.log('\n✅ All products already exist. No new products to add.');
      return;
    }

    // Insert products
    console.log(`\n📦 Adding ${productsToAdd.length} product(s)...`);
    const result = await productsCollection.insertMany(productsToAdd);

    console.log(`\n✅ Successfully added ${result.insertedCount} product(s):`);
    productsToAdd.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Error adding products:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit(0);
  }
}

// Run the script
addProducts();


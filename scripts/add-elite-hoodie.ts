import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import type { Product } from '../src/lib/types.js';

async function addEliteHoodie() {
  try {
    // Load environment variables
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Omit<Product, 'id'>>('products');

    const product: Omit<Product, 'id'> = {
      name: "Elite Volleyball Hoodie",
      description: "Show your Elite Volleyball pride with this premium hoodie! Comfortable and stylish, perfect for games, practices, and daily wear.",
      price: 45.00,
      image: "/Elite.png",
      category: "Elite Volleyball",
      shopType: "regular-shop",
      inStock: true,
      sizes: ["S", "M", "L", "XL", "XXL", "3XL"],
      colors: []
    };

    // Check if product already exists
    const existingProduct = await productsCollection.findOne({ 
      name: product.name,
      category: product.category 
    });

    if (existingProduct) {
      console.log('Product already exists!');
      return;
    }

    // Insert product into database
    const result = await productsCollection.insertOne(product);

    if (result.insertedId) {
      console.log('✅ Successfully added Elite Volleyball Hoodie!');
      console.log(`Product ID: ${result.insertedId.toString()}`);
    } else {
      console.error('❌ Failed to create product');
    }

    await client.close();
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

// Run the script
addEliteHoodie()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


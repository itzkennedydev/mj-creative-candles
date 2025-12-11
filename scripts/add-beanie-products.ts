/**
 * Script to add beanie products with images
 * Run with: npx tsx scripts/add-beanie-products.ts
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';
import type { Product } from '../src/lib/types.js';

async function addBeanieProducts() {
  try {
    // Load environment variables
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Omit<Product, 'id'>>('products');

const beanieProducts: Array<Omit<Product, 'id'>> = [
  {
    name: "Forest Green Beanie",
    description: "Custom embroidered beanie with forest green design",
    price: 25.00,
    image: "/Forest Green.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Forest Green"]
  },
  {
    name: "Gold & White Beanie",
    description: "Custom embroidered beanie with gold and white design",
    price: 25.00,
    image: "/Gold:White.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Gold", "White"]
  },
  {
    name: "Icon Grey Beanie",
    description: "Custom embroidered beanie in icon grey",
    price: 25.00,
    image: "/Icon Grey.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Grey"]
  },
  {
    name: "Maroon & Black Beanie",
    description: "Custom embroidered beanie with maroon and black design",
    price: 25.00,
    image: "/Maroon:black.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Maroon", "Black"]
  },
  {
    name: "Pink Raspberry Beanie",
    description: "Custom embroidered beanie in pink raspberry",
    price: 25.00,
    image: "/Pink Rasberry.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Pink Raspberry"]
  },
  {
    name: "Purple & Black Beanie",
    description: "Custom embroidered beanie with purple and black design",
    price: 25.00,
    image: "/Purple:black.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Purple", "Black"]
  },
  {
    name: "Red & Black Beanie",
    description: "Custom embroidered beanie with red and black design",
    price: 25.00,
    image: "/Red:black.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Red", "Black"]
  },
  {
    name: "Red & Royal Beanie",
    description: "Custom embroidered beanie with red and royal blue design",
    price: 25.00,
    image: "/Red:royal.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Red", "Royal Blue"]
  },
  {
    name: "True Royal Beanie",
    description: "Custom embroidered beanie in true royal blue",
    price: 25.00,
    image: "/True Royal.jpeg",
    category: "Hats",
    shopType: "regular-shop",
    inStock: true,
    sizes: ["One Size"],
    colors: ["Royal Blue"]
  }
];
    
    // Check if products already exist and add them
    for (const product of beanieProducts) {
      const existing = await productsCollection.findOne({ name: product.name });
      if (existing) {
        console.log(`Product "${product.name}" already exists, skipping...`);
        continue;
      }
      
      const result = await productsCollection.insertOne(product);
      if (result.insertedId) {
        console.log(`✅ Added product: ${product.name}`);
      } else {
        console.log(`❌ Failed to add product: ${product.name}`);
      }
    }
    
    console.log('All beanie products processed!');
    await client.close();
  } catch (error) {
    console.error('Error adding products:', error);
    throw error;
  }
}

// Run the script
addBeanieProducts()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


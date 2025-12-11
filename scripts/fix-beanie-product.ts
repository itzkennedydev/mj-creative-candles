/**
 * Script to fix beanie products - combine into one product with correct colors
 * Run with: npx tsx scripts/fix-beanie-product.ts
 */

import { config } from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import type { Product } from '../src/lib/types.js';

async function fixBeanieProduct() {
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

    // Delete all existing beanie products
    const beanieNames = [
      "Forest Green Beanie",
      "Gold & White Beanie",
      "Icon Grey Beanie",
      "Maroon & Black Beanie",
      "Pink Raspberry Beanie",
      "Purple & Black Beanie",
      "Red & Black Beanie",
      "Red & Royal Beanie",
      "True Royal Beanie"
    ];

    console.log('Deleting existing beanie products...');
    const deleteResult = await productsCollection.deleteMany({
      name: { $in: beanieNames }
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} existing beanie products`);

    // Create single beanie product with all colors and images
    const beanieProduct: Omit<Product, 'id'> = {
      name: "Beanie",
      description: "Custom embroidered beanie available in multiple colors. Perfect for showing your style!",
      price: 25.00,
      image: "/Forest Green.jpeg", // Primary image
      category: "Hats",
      shopType: "regular-shop",
      inStock: true,
      sizes: ["One Size"],
      colors: [
        "Forest Green",
        "Gold & White",
        "Icon Grey",
        "Maroon & Black",
        "Pink Raspberry",
        "Purple & Black",
        "Red & Black",
        "Red & Royal",
        "True Royal"
      ],
      images: [
        {
          id: "img_forest_green",
          imageId: "",
          dataUri: "/Forest Green.jpeg",
          mimeType: "image/jpeg",
          filename: "Forest Green.jpeg"
        },
        {
          id: "img_gold_white",
          imageId: "",
          dataUri: "/Gold:White.jpeg",
          mimeType: "image/jpeg",
          filename: "Gold:White.jpeg"
        },
        {
          id: "img_icon_grey",
          imageId: "",
          dataUri: "/Icon Grey.jpeg",
          mimeType: "image/jpeg",
          filename: "Icon Grey.jpeg"
        },
        {
          id: "img_maroon_black",
          imageId: "",
          dataUri: "/Maroon:black.jpeg",
          mimeType: "image/jpeg",
          filename: "Maroon:black.jpeg"
        },
        {
          id: "img_pink_raspberry",
          imageId: "",
          dataUri: "/Pink Rasberry.jpeg",
          mimeType: "image/jpeg",
          filename: "Pink Rasberry.jpeg"
        },
        {
          id: "img_purple_black",
          imageId: "",
          dataUri: "/Purple:black.jpeg",
          mimeType: "image/jpeg",
          filename: "Purple:black.jpeg"
        },
        {
          id: "img_red_black",
          imageId: "",
          dataUri: "/Red:black.jpeg",
          mimeType: "image/jpeg",
          filename: "Red:black.jpeg"
        },
        {
          id: "img_red_royal",
          imageId: "",
          dataUri: "/Red:royal.jpeg",
          mimeType: "image/jpeg",
          filename: "Red:royal.jpeg"
        },
        {
          id: "img_true_royal",
          imageId: "",
          dataUri: "/True Royal.jpeg",
          mimeType: "image/jpeg",
          filename: "True Royal.jpeg"
        }
      ]
    };

    // Check if product already exists
    const existing = await productsCollection.findOne({ name: "Beanie", category: "Hats" });
    if (existing) {
      console.log('Beanie product already exists, updating...');
      await productsCollection.updateOne(
        { name: "Beanie", category: "Hats" },
        { $set: beanieProduct }
      );
      console.log('✅ Updated Beanie product');
    } else {
      const result = await productsCollection.insertOne(beanieProduct);
      if (result.insertedId) {
        console.log('✅ Created Beanie product');
        console.log(`Product ID: ${result.insertedId.toString()}`);
      } else {
        console.log('❌ Failed to create product');
      }
    }
    
    await client.close();
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error fixing beanie product:', error);
    throw error;
  }
}

// Run the script
fixBeanieProduct()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });



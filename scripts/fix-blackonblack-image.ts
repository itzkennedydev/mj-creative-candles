/**
 * Script to update BlackonBlack image reference from .png to .jpg
 * Run with: npx tsx scripts/fix-blackonblack-image.ts
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function fixBlackOnBlackImage() {
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

    // Find the Moline Beanie product
    const molineBeanie = await productsCollection.findOne({ 
      name: "Moline Beanie"
    });

    if (!molineBeanie) {
      console.log('❌ Moline Beanie not found!');
      await client.close();
      return;
    }

    console.log('Found Moline Beanie:');
    console.log(`  Current primary image: ${molineBeanie.image}`);
    console.log(`  Current images array:`, molineBeanie.images?.map((img: any) => 
      typeof img === 'string' ? img : img.dataUri
    ));

    // Update image references from .png to .jpg for BlackonBlack
    const updatedImages = molineBeanie.images?.map((img: any) => {
      if (typeof img === 'string') {
        return img.replace('/BlackonBlack.png', '/BlackonBlack.jpg');
      } else if (img && img.dataUri) {
        return {
          ...img,
          dataUri: img.dataUri.replace('/BlackonBlack.png', '/BlackonBlack.jpg'),
          filename: img.filename?.replace('BlackonBlack.png', 'BlackonBlack.jpg'),
          mimeType: img.mimeType?.replace('image/png', 'image/jpeg')
        };
      }
      return img;
    }) || [];

    // Update the product
    const result = await productsCollection.updateOne(
      { name: "Moline Beanie" },
      { 
        $set: { 
          images: updatedImages
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ Successfully updated BlackonBlack image reference to .jpg');
    } else {
      console.log('\n⚠️  No changes made (may already be correct)');
    }

    // Verify the update
    const updated = await productsCollection.findOne({ name: "Moline Beanie" });
    console.log('\nUpdated images array:', updated?.images?.map((img: any) => 
      typeof img === 'string' ? img : img.dataUri
    ));

    await client.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

fixBlackOnBlackImage()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


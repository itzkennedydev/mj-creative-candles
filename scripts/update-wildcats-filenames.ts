import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function updateWildcatsFilenames() {
  try {
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find the Wildcats product
    const product = await productsCollection.findOne({ 
      school: 'north',
      name: "Wildcats Crewneck Sweatshirt"
    });

    if (!product) {
      console.error('❌ Wildcats product not found!');
      await client.close();
      return;
    }

    console.log('Found Wildcats product:', product._id.toString());

    // Update the image paths from .jpeg to .jpg
    const updateData: any = {
      image: "/WildcatsBlue.jpg", // Changed from .jpeg to .jpg
    };

    // Update additional images array if it exists
    if (product.images && product.images.length > 0) {
      updateData.images = product.images.map((img: any) => ({
        ...img,
        dataUri: img.dataUri.replace('.jpeg', '.jpg'),
        filename: img.filename.replace('.jpeg', '.jpg')
      }));
    }

    const result = await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: updateData
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Wildcats product filenames!');
      console.log('   - Updated primary image to /WildcatsBlue.jpg');
      if (updateData.images) {
        console.log('   - Updated additional images to .jpg');
      }
    } else {
      console.log('⚠️  No changes made');
    }

    await client.close();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

updateWildcatsFilenames()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


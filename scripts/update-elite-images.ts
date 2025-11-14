import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function updateEliteImages() {
  try {
    // Load environment variables
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find the Elite Volleyball product
    const product = await productsCollection.findOne({ 
      name: "Elite Volleyball Crewneck"
    });

    if (!product) {
      console.error('❌ Product not found!');
      await client.close();
      return;
    }

    console.log('Found product:', product._id.toString());

    // Update the product image to use Elite.png
    const result = await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          image: "/Elite.png"
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Elite Volleyball product!');
      console.log('   - Updated product image to /Elite.png');
    } else {
      console.log('⚠️  No changes made (product may already be updated)');
    }

    await client.close();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Run the script
updateEliteImages()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


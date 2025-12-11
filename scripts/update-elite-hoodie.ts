import { config } from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';

async function updateEliteHoodie() {
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

    // Find the Elite Volleyball Hoodie product
    const product = await productsCollection.findOne({ 
      name: "Elite Volleyball Hoodie"
    });

    if (!product) {
      console.error('❌ Product not found!');
      await client.close();
      return;
    }

    console.log('Found product:', product._id.toString());

    // Update the product
    const result = await productsCollection.updateOne(
      { _id: product._id },
      {
        $set: {
          shopType: "spirit-wear",
          image: "/schools/Elite.png",
          category: "Elite Volleyball"
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Elite Volleyball Hoodie!');
      console.log('   - Changed to spirit-wear');
      console.log('   - Updated image to /schools/Elite.png');
      console.log('   - Category: Elite Volleyball');
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
updateEliteHoodie()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


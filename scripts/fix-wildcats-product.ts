import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function fixWildcatsProduct() {
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

    // Find the main Wildcats product (crewneck)
    const crewneckProduct = await productsCollection.findOne({ 
      school: 'north',
      name: "Wildcats Crewneck Sweatshirt"
    });

    // Find the black variant to delete
    const blackVariant = await productsCollection.findOne({ 
      school: 'north',
      name: "Wildcats T-Shirt"
    });

    if (!crewneckProduct) {
      console.error('❌ Wildcats Crewneck Sweatshirt not found!');
      await client.close();
      return;
    }

    console.log('Found Wildcats Crewneck Sweatshirt:', crewneckProduct._id.toString());

    // Update the crewneck product to include both colors and both images
    const updateData: any = {
      colors: ["Royal Blue", "Black"],
      image: "/WildcatsBlue.jpg", // Keep blue as primary
      images: [
        {
          dataUri: "/WildcatsBlack.jpg",
          mimeType: "image/jpeg",
          filename: "WildcatsBlack.jpg"
        }
      ]
    };

    const result = await productsCollection.updateOne(
      { _id: crewneckProduct._id },
      {
        $set: updateData
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated Wildcats Crewneck Sweatshirt!');
      console.log('   - Added "Black" to colors array');
      console.log('   - Added WildcatsBlack.jpg as additional image');
      console.log('   - Primary image: /WildcatsBlue.jpg');
    } else {
      console.log('⚠️  No changes made to crewneck product');
    }

    // Delete the separate black variant if it exists
    if (blackVariant) {
      const deleteResult = await productsCollection.deleteOne({ _id: blackVariant._id });
      if (deleteResult.deletedCount > 0) {
        console.log('✅ Deleted separate black variant product');
      }
    }

    await client.close();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Run the script
fixWildcatsProduct()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


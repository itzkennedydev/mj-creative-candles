import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function add3XLToBlackProducts() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Update black T-shirt (UTHS Spirit T-Shirt)
    const tshirtResult = await productsCollection.updateMany(
      { 
        name: { $regex: /UTHS Spirit T-Shirt/i },
        colors: { $in: ['Black'] }
      },
      { 
        $addToSet: { sizes: '3XL' }
      }
    );
    console.log(`Updated ${tshirtResult.modifiedCount} black T-shirt product(s)`);

    // Update black hoodie (UTHS Spirit Hoodie)
    const hoodieResult = await productsCollection.updateMany(
      { 
        name: { $regex: /UTHS Spirit Hoodie/i },
        colors: { $in: ['Black'] }
      },
      { 
        $addToSet: { sizes: '3XL' }
      }
    );
    console.log(`Updated ${hoodieResult.modifiedCount} black hoodie product(s)`);

    console.log('✅ 3XL size added to black T-shirt and hoodie successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
    throw error;
  }
}

add3XLToBlackProducts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });



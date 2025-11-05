import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function updateBeanieColors() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Update beanie to have no color options (single color product)
    const result = await productsCollection.updateMany(
      { 
        name: { $regex: /beanie/i },
        school: 'moline'
      },
      { 
        $set: { colors: [] }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} beanie product(s)`);
    console.log('Beanie now has no color options (single color product)');
  } catch (error) {
    console.error('❌ Error updating beanie:', error);
    throw error;
  }
}

updateBeanieColors()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });



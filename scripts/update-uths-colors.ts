import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function updateUTHSColors() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Update UTHS products to have only Black color
    const result = await productsCollection.updateMany(
      { 
        name: { $regex: /UTHS/i },
        school: 'united-township'
      },
      { 
        $set: { colors: ["Black"] }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} UTHS product(s)`);
    console.log('UTHS products now have only Black color option');
  } catch (error) {
    console.error('❌ Error updating UTHS products:', error);
    throw error;
  }
}

updateUTHSColors()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function updateProductSchools() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Update MAROONS product to Moline
    const molineResult = await productsCollection.updateMany(
      { 
        name: { $regex: /MAROONS/i },
        shopType: 'spirit-wear'
      },
      { 
        $set: { school: 'moline' }
      }
    );
    console.log(`Updated ${molineResult.modifiedCount} Moline product(s)`);

    // Update UTHS products to United Township
    const utResult = await productsCollection.updateMany(
      { 
        name: { $regex: /UTHS/i },
        shopType: 'spirit-wear'
      },
      { 
        $set: { school: 'united-township' }
      }
    );
    console.log(`Updated ${utResult.modifiedCount} United Township product(s)`);

    // Also check for products with "United Township" in name
    const utAltResult = await productsCollection.updateMany(
      { 
        name: { $regex: /United Township/i },
        shopType: 'spirit-wear'
      },
      { 
        $set: { school: 'united-township' }
      }
    );
    console.log(`Updated ${utAltResult.modifiedCount} additional United Township product(s)`);

    console.log('✅ Product school assignments updated successfully!');
  } catch (error) {
    console.error('❌ Error updating products:', error);
    throw error;
  }
}

updateProductSchools()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


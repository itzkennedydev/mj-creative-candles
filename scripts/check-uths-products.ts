import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function checkUTHSProducts() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find all UTHS products
    const products = await productsCollection.find({
      school: 'united-township'
    }).toArray();
    
    console.log(`Found ${products.length} UTHS products:`);
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product._id})`);
      console.log(`  Colors: ${JSON.stringify(product.colors)}`);
    });
  } catch (error) {
    console.error('❌ Error checking products:', error);
    throw error;
  }
}

checkUTHSProducts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });



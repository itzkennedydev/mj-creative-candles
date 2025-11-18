import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function checkWildcatsPaths() {
  try {
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const products = await db.collection('products').find({ school: 'north' }).toArray();
    
    console.log('Wildcats Products Image Paths:');
    console.log('================================\n');
    
    products.forEach(p => {
      console.log(`Product: ${p.name}`);
      console.log(`Primary Image: ${p.image}`);
      if (p.images && p.images.length > 0) {
        console.log('Additional Images:');
        p.images.forEach((img: any, idx: number) => {
          console.log(`  [${idx}]: ${img.dataUri}`);
        });
      }
      console.log('');
    });
    
    await client.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkWildcatsPaths()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


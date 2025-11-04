import { config } from 'dotenv';
import clientPromise from '../src/lib/mongodb';

config({ path: '.env.local' });

async function addMolineBeanie() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Check if beanie already exists
    const existingBeanie = await productsCollection.findOne({
      name: { $regex: /beanie/i },
      school: 'moline'
    });

    if (existingBeanie) {
      console.log('⚠️  Beanie product already exists for Moline');
      console.log('Product ID:', existingBeanie._id);
      return;
    }

    // Create the beanie product
    const beanieProduct = {
      name: "Moline Beanie",
      description: "Show your Maroons pride with this cozy knitted beanie! Features a maroon and black striped design with a pom-pom on top and an embroidered 'M' logo on the cuff. Perfect for cold weather and game days.",
      price: 25.00,
      image: "/Beanie.png",
      category: "Apparel",
      shopType: "spirit-wear",
      school: "moline",
      inStock: true,
      sizes: [], // Beanies typically don't have sizes or are one-size-fits-all
      colors: [] // Single color product - maroon and black striped design
    };

    const result = await productsCollection.insertOne(beanieProduct);
    
    console.log(`✅ Beanie product added successfully!`);
    console.log(`Product ID: ${result.insertedId}`);
    console.log(`Name: ${beanieProduct.name}`);
    console.log(`Price: $${beanieProduct.price}`);
    console.log(`School: ${beanieProduct.school}`);
  } catch (error) {
    console.error('❌ Error adding beanie product:', error);
    throw error;
  }
}

addMolineBeanie()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


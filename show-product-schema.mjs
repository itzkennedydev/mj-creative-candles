import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://Vercel-Admin-MJ:nLWuLIY8LShzX6Jl@mj.jycksqq.mongodb.net/?retryWrites=true&w=majority&appName=MJ";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('mj-creative-candles');
    const productCollection = db.collection('products');
    
    const products = await productCollection.find({ inStock: true }).limit(3).toArray();
    
    console.log("Sample products from MJ Creative Candles database:\n");
    products.forEach((product, index) => {
      console.log(`\n=== Product ${index + 1} ===`);
      console.log(`Name: ${product.name}`);
      console.log(`Category: ${product.category}`);
      console.log(`Regular Price: $${product.regularPrice}`);
      console.log(`Sale Price: $${product.salePrice}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Visibility: ${product.visibility}`);
      console.log(`Images: ${product.productImages?.length || 0} images`);
    });
    
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

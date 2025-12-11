import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = "mongodb+srv://Vercel-Admin-MJ:nLWuLIY8LShzX6Jl@mj.jycksqq.mongodb.net/?retryWrites=true&w=majority&appName=MJ";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    
    // Check mj-creative-candles database
    const db = client.db('mj-creative-candles');
    const collections = await db.listCollections().toArray();
    
    console.log("\n📦 Collections in 'mj-creative-candles' database:");
    collections.forEach(col => console.log(` - ${col.name}`));
    
    // Check for products
    if (collections.some(col => col.name === 'products')) {
      const productCollection = db.collection('products');
      const productCount = await productCollection.countDocuments();
      console.log(`\n🛍️ Total products: ${productCount}`);
      
      // Show sample product
      if (productCount > 0) {
        const sampleProduct = await productCollection.findOne();
        console.log("\n📝 Sample product:");
        console.log(JSON.stringify(sampleProduct, null, 2));
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

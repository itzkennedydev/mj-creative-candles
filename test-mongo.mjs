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
    console.log("✅ Successfully connected to MongoDB!");
    
    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    console.log("\n📊 Available databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
    
    // Check the main database (likely named after cluster or default)
    // Try common database names
    const dbNames = ['test', 'stitch-please', 'MJ', 'candles', 'shop'];
    
    for (const dbName of dbNames) {
      try {
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        if (collections.length > 0) {
          console.log(`\n📦 Collections in '${dbName}' database:`);
          collections.forEach(col => console.log(` - ${col.name}`));
          
          // Check for products
          if (collections.some(col => col.name === 'products')) {
            const productCollection = db.collection('products');
            const productCount = await productCollection.countDocuments();
            console.log(`\n🛍️ Total products in '${dbName}': ${productCount}`);
          }
        }
      } catch (err) {
        // Database doesn't exist, continue
      }
    }
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
  } finally {
    await client.close();
    console.log("\n✅ Connection closed");
  }
}

run().catch(console.dir);

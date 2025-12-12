import { MongoClient, ServerApiVersion } from "mongodb";

const uri =
  "mongodb+srv://Vercel-Admin-MJ:nLWuLIY8LShzX6Jl@mj.jycksqq.mongodb.net/?retryWrites=true&w=majority&appName=MJ";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("mj-creative-candles");
    const productCollection = db.collection("products");

    const productCount = await productCollection.countDocuments();
    console.log(`\n🛍️ Total products: ${productCount}`);

    // Check visibility
    const visible = await productCollection.countDocuments({
      visibility: "visible",
    });
    const hidden = await productCollection.countDocuments({
      visibility: "hidden",
    });
    const noVisibility = await productCollection.countDocuments({
      visibility: { $exists: false },
    });

    console.log(`\nVisibility Status:`);
    console.log(`  Visible: ${visible}`);
    console.log(`  Hidden: ${hidden}`);
    console.log(`  No visibility field: ${noVisibility}`);

    // Check categories
    const categories = await productCollection
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log(`\nProducts by Category:`);
    categories.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    // Show all products with their categories and tags
    console.log(`\n📝 All Products:\n`);
    const allProducts = await productCollection
      .find(
        {},
        {
          projection: { name: 1, category: 1, tags: 1, visibility: 1 },
        },
      )
      .toArray();

    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(
        `   Tags: ${p.tags && p.tags.length > 0 ? p.tags.join(", ") : "none"}`,
      );
      console.log(`   Visibility: ${p.visibility || "not set"}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

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

async function fixProducts() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("mj-creative-candles");
    const productCollection = db.collection("products");

    console.log("\n🔧 Starting product fixes...\n");

    // 1. Set all hidden products to visible
    const visibilityResult = await productCollection.updateMany(
      { visibility: "hidden" },
      { $set: { visibility: "visible" } },
    );
    console.log(
      `✅ Updated ${visibilityResult.modifiedCount} products to visible`,
    );

    // 2. Fix categories - "Squeezy Wax" -> "Wax Melts"
    const squeezyResult = await productCollection.updateMany(
      { category: "Squeezy Wax" },
      { $set: { category: "Wax Melts" } },
    );
    console.log(
      `✅ Fixed ${squeezyResult.modifiedCount} "Squeezy Wax" -> "Wax Melts"`,
    );

    // 3. Fix categories - "Wax Melt Box" -> "Wax Melt Boxes"
    const boxResult = await productCollection.updateMany(
      { category: "Wax Melt Box" },
      { $set: { category: "Wax Melt Boxes" } },
    );
    console.log(
      `✅ Fixed ${boxResult.modifiedCount} "Wax Melt Box" -> "Wax Melt Boxes"`,
    );

    // 4. Fix categories - "Dessert Candle" -> "Dessert Candles"
    const dessertResult = await productCollection.updateMany(
      { category: "Dessert Candle" },
      { $set: { category: "Dessert Candles" } },
    );
    console.log(
      `✅ Fixed ${dessertResult.modifiedCount} "Dessert Candle" -> "Dessert Candles"`,
    );

    // 5. Fix products with category "featured" - set to "Wax Melts" based on their names
    const featuredProducts = await productCollection
      .find({ category: "featured" })
      .toArray();
    console.log(
      `\n📝 Found ${featuredProducts.length} products with category "featured":`,
    );

    for (const product of featuredProducts) {
      console.log(`   - ${product.name}`);
      // Set to Wax Melts since they appear to be wax melts
      await productCollection.updateOne(
        { _id: product._id },
        { $set: { category: "Wax Melts" } },
      );
    }
    console.log(
      `✅ Fixed ${featuredProducts.length} "featured" -> "Wax Melts"`,
    );

    // 6. Fix Uncategorized products
    const uncategorizedProducts = await productCollection
      .find({ category: "Uncategorized" })
      .toArray();
    console.log(
      `\n📝 Found ${uncategorizedProducts.length} uncategorized products:`,
    );

    for (const product of uncategorizedProducts) {
      console.log(`   - ${product.name}`);
      // These appear to be Wax Melts based on the names
      await productCollection.updateOne(
        { _id: product._id },
        { $set: { category: "Wax Melts" } },
      );
    }
    console.log(
      `✅ Fixed ${uncategorizedProducts.length} "Uncategorized" -> "Wax Melts"`,
    );

    // 7. Add proper tags to all products
    console.log(`\n🏷️  Adding tags to products...`);

    // Wax Melts tags
    await productCollection.updateMany(
      { category: "Wax Melts" },
      { $set: { tags: ["wax melt", "wax melts"] } },
    );

    // Wax Melt Boxes tags
    await productCollection.updateMany(
      { category: "Wax Melt Boxes" },
      { $set: { tags: ["wax melt box", "box", "wax melts"] } },
    );

    // Dessert Candles tags
    await productCollection.updateMany(
      { category: "Dessert Candles" },
      { $set: { tags: ["dessert candle", "dessert", "candle"] } },
    );

    console.log(`✅ Added tags to all products`);

    // 8. Verify the changes
    console.log(`\n📊 Final Status:\n`);

    const categories = await productCollection
      .aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    console.log("Products by Category:");
    categories.forEach((cat) => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });

    const visible = await productCollection.countDocuments({
      visibility: "visible",
    });
    const hidden = await productCollection.countDocuments({
      visibility: "hidden",
    });

    console.log(`\nVisibility Status:`);
    console.log(`  Visible: ${visible}`);
    console.log(`  Hidden: ${hidden}`);

    console.log("\n✅ All fixes applied successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

fixProducts().catch(console.error);

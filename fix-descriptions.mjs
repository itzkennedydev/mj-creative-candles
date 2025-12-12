import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, ".env.local") });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI not found in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

async function fixDescriptions() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection("products");

    // Find all products with \n in descriptions
    const products = await productsCollection.find({}).toArray();

    console.log(`\nTotal products: ${products.length}`);

    let updatedCount = 0;
    const updates = [];

    for (const product of products) {
      if (product.description?.includes("\\n")) {
        // Replace literal \n with actual newlines
        const fixedDescription = product.description
          .replace(/\\n/g, "\n")
          .replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with just 2
          .trim();

        updates.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                description: fixedDescription,
              },
            },
          },
        });

        updatedCount++;
      }
    }

    if (updates.length > 0) {
      console.log(`\nFixing ${updates.length} product descriptions...`);

      const result = await productsCollection.bulkWrite(updates);

      console.log("\n✓ Description cleanup completed!");
      console.log(`  - Products updated: ${result.modifiedCount}`);
      console.log(`  - Matched products: ${result.matchedCount}`);

      // Show a sample of fixed description
      const sample = await productsCollection.findOne({
        name: "Cucumber Melon",
      });
      if (sample) {
        console.log("\n\nSample fixed description:");
        console.log("Product: Cucumber Melon");
        console.log("-".repeat(80));
        console.log(sample.description);
        console.log("-".repeat(80));
      }
    } else {
      console.log("\n✓ No descriptions need fixing!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

fixDescriptions();

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

async function auditDescriptions() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("mj-creative-candles");
    const products = await db.collection("products").find({}).toArray();

    console.log(`\nTotal products: ${products.length}\n`);

    let issuesFound = 0;
    const productsWithIssues = [];

    products.forEach((product) => {
      const hasNewlines = product.description?.includes("\\n");
      const hasExcessiveWhitespace = product.description?.match(/\s{3,}/);
      const hasUnparsedEscapes = product.description?.includes("\\n");

      if (hasNewlines || hasExcessiveWhitespace || hasUnparsedEscapes) {
        issuesFound++;
        productsWithIssues.push({
          id: product._id.toString(),
          name: product.name,
          descriptionLength: product.description?.length || 0,
          hasNewlines,
          hasExcessiveWhitespace: !!hasExcessiveWhitespace,
          preview: product.description?.substring(0, 150) + "...",
        });
      }
    });

    console.log(`Products with description issues: ${issuesFound}\n`);
    console.log("=".repeat(80));

    productsWithIssues.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Length: ${product.descriptionLength} chars`);
      console.log(`   Has \\n characters: ${product.hasNewlines}`);
      console.log(
        `   Has excessive whitespace: ${product.hasExcessiveWhitespace}`,
      );
      console.log(`   Preview: ${product.preview}`);
    });

    console.log("\n" + "=".repeat(80));

    // Show a full example of one problematic description
    if (productsWithIssues.length > 0) {
      const example = products.find(
        (p) => p._id.toString() === productsWithIssues[0].id,
      );
      console.log("\n\nFULL EXAMPLE OF PROBLEMATIC DESCRIPTION:");
      console.log(`Product: ${example.name}`);
      console.log("Raw description:");
      console.log("-".repeat(80));
      console.log(example.description);
      console.log("-".repeat(80));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

auditDescriptions();

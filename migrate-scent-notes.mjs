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

function extractScentNotes(description) {
  const lines = description.split("\n");
  const notes = { top: null, middle: null, base: null };
  let cleanDescription = [];
  let foundNotes = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check for scent notes
    if (lowerLine.startsWith("top-") || lowerLine.startsWith("top -")) {
      notes.top = line.substring(line.indexOf("-") + 1).trim();
      foundNotes = true;
    } else if (
      lowerLine.startsWith("middle-") ||
      lowerLine.startsWith("middle -")
    ) {
      notes.middle = line.substring(line.indexOf("-") + 1).trim();
      foundNotes = true;
    } else if (
      lowerLine.startsWith("bottom-") ||
      lowerLine.startsWith("bottom -") ||
      lowerLine.startsWith("base-") ||
      lowerLine.startsWith("base -")
    ) {
      notes.base = line.substring(line.indexOf("-") + 1).trim();
      foundNotes = true;
    } else if (line && !foundNotes) {
      // Only add to clean description if we haven't found notes yet
      cleanDescription.push(line);
    } else if (line && foundNotes && i === lines.length - 1) {
      // Add trailing text if it's not a scent note
      if (
        !lowerLine.startsWith("top") &&
        !lowerLine.startsWith("middle") &&
        !lowerLine.startsWith("bottom") &&
        !lowerLine.startsWith("base")
      ) {
        cleanDescription.push(line);
      }
    }
  }

  // Join clean description and remove extra whitespace
  const finalDescription = cleanDescription
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    description: finalDescription,
    topNotes: notes.top,
    middleNotes: notes.middle,
    baseNotes: notes.base,
    hasNotes: !!(notes.top || notes.middle || notes.base),
  };
}

async function migrateProducts() {
  try {
    await client.connect();
    console.log("Connected to MongoDB\n");

    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection("products");

    const products = await productsCollection.find({}).toArray();
    console.log(`Total products: ${products.length}\n`);

    const updates = [];
    let productsWithNotes = 0;

    for (const product of products) {
      const extracted = extractScentNotes(product.description || "");

      if (extracted.hasNotes) {
        productsWithNotes++;
        updates.push({
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                description: extracted.description,
                topNotes: extracted.topNotes,
                middleNotes: extracted.middleNotes,
                baseNotes: extracted.baseNotes,
              },
            },
          },
        });

        console.log(`✓ ${product.name}`);
        console.log(
          `  Original description length: ${product.description?.length || 0} chars`,
        );
        console.log(
          `  Clean description length: ${extracted.description.length} chars`,
        );
        if (extracted.topNotes) console.log(`  Top: ${extracted.topNotes}`);
        if (extracted.middleNotes)
          console.log(`  Middle: ${extracted.middleNotes}`);
        if (extracted.baseNotes) console.log(`  Base: ${extracted.baseNotes}`);
        console.log();
      }
    }

    console.log("=".repeat(80));
    console.log(`\nProducts with scent notes: ${productsWithNotes}`);
    console.log(
      `Products without scent notes: ${products.length - productsWithNotes}\n`,
    );

    if (updates.length > 0) {
      console.log(`Migrating ${updates.length} products...\n`);

      const result = await productsCollection.bulkWrite(updates);

      console.log("✅ Migration completed!");
      console.log(`   Modified: ${result.modifiedCount}`);
      console.log(`   Matched: ${result.matchedCount}\n`);

      // Show a sample migrated product
      const sample = await productsCollection.findOne({
        topNotes: { $exists: true, $ne: null },
      });

      if (sample) {
        console.log("Sample migrated product:");
        console.log("=".repeat(80));
        console.log(`Product: ${sample.name}`);
        console.log(`\nDescription:\n${sample.description}`);
        console.log(`\nScent Notes:`);
        console.log(`  Top: ${sample.topNotes || "N/A"}`);
        console.log(`  Middle: ${sample.middleNotes || "N/A"}`);
        console.log(`  Base: ${sample.baseNotes || "N/A"}`);
        console.log("=".repeat(80));
      }
    } else {
      console.log("No products to migrate.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

migrateProducts();

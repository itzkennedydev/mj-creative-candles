#!/usr/bin/env node
/**
 * Database Migration Script
 *
 * This script adds candle-specific fields to the products collection:
 * - topNotes: Top/initial scent notes
 * - middleNotes: Middle/heart scent notes
 * - baseNotes: Base/lasting scent notes
 * - scentFamily: Scent category (e.g., Citrus, Floral, Woody)
 * - burnTime: Estimated burn time (e.g., "40-50 hours")
 *
 * Usage: node migrate-candle-fields.mjs [--dry-run]
 */

import { MongoClient } from "mongodb";

const uri =
  "mongodb+srv://Vercel-Admin-MJ:nLWuLIY8LShzX6Jl@mj.jycksqq.mongodb.net/?retryWrites=true&w=majority&appName=MJ";
const client = new MongoClient(uri);

const DRY_RUN = process.argv.includes("--dry-run");

async function migrate() {
  try {
    console.log("🚀 Starting database migration...\n");

    if (DRY_RUN) {
      console.log("⚠️  DRY RUN MODE - No changes will be made\n");
    }

    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection("products");

    // Get all products
    const totalProducts = await productsCollection.countDocuments();
    console.log(`📦 Found ${totalProducts} products in the database\n`);

    // Check how many products already have the new fields
    const productsWithNewFields = await productsCollection.countDocuments({
      $or: [
        { topNotes: { $exists: true } },
        { middleNotes: { $exists: true } },
        { baseNotes: { $exists: true } },
        { scentFamily: { $exists: true } },
        { burnTime: { $exists: true } },
      ],
    });

    console.log(
      `ℹ️  ${productsWithNewFields} products already have some candle-specific fields\n`,
    );

    // Get products that need migration
    const productsToMigrate = await productsCollection
      .find({
        $and: [
          { topNotes: { $exists: false } },
          { middleNotes: { $exists: false } },
          { baseNotes: { $exists: false } },
          { scentFamily: { $exists: false } },
          { burnTime: { $exists: false } },
        ],
      })
      .toArray();

    console.log(`🔄 ${productsToMigrate.length} products need migration\n`);

    if (productsToMigrate.length === 0) {
      console.log(
        "✨ All products already have the new fields. No migration needed.\n",
      );
      return;
    }

    if (DRY_RUN) {
      console.log("📋 Products that would be updated:\n");
      productsToMigrate.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product._id})`);
      });
      console.log(
        "\n✅ Dry run complete. Run without --dry-run to apply changes.\n",
      );
      return;
    }

    // Perform the migration
    console.log("📝 Adding candle-specific fields to products...\n");

    const updateOperation = {
      $set: {
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        scentFamily: "",
        burnTime: "",
        updatedAt: new Date(),
      },
    };

    const result = await productsCollection.updateMany(
      {
        $and: [
          { topNotes: { $exists: false } },
          { middleNotes: { $exists: false } },
          { baseNotes: { $exists: false } },
          { scentFamily: { $exists: false } },
          { burnTime: { $exists: false } },
        ],
      },
      updateOperation,
    );

    console.log(`✅ Migration complete!\n`);
    console.log(`   - Matched: ${result.matchedCount} documents`);
    console.log(`   - Modified: ${result.modifiedCount} documents\n`);

    // Verify the migration
    const verifyCount = await productsCollection.countDocuments({
      topNotes: { $exists: true },
      middleNotes: { $exists: true },
      baseNotes: { $exists: true },
      scentFamily: { $exists: true },
      burnTime: { $exists: true },
    });

    console.log(
      `✅ Verification: ${verifyCount}/${totalProducts} products now have all candle fields\n`,
    );

    // Show a sample updated product
    const sampleProduct = await productsCollection.findOne({
      topNotes: { $exists: true },
    });

    if (sampleProduct) {
      console.log("📄 Sample updated product:\n");
      console.log(`   Name: ${sampleProduct.name}`);
      console.log(`   Top Notes: "${sampleProduct.topNotes || "(empty)"}"`);
      console.log(
        `   Middle Notes: "${sampleProduct.middleNotes || "(empty)"}"`,
      );
      console.log(`   Base Notes: "${sampleProduct.baseNotes || "(empty)"}"`);
      console.log(
        `   Scent Family: "${sampleProduct.scentFamily || "(empty)"}"`,
      );
      console.log(`   Burn Time: "${sampleProduct.burnTime || "(empty)"}"`);
      console.log();
    }

    console.log(
      "🎉 Migration successful! You can now edit products in the admin panel to add scent information.\n",
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("👋 Disconnected from MongoDB\n");
  }
}

// Run migration
migrate().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Script to upload local images to MongoDB GridFS
 * This will upload all images from public/CTA and public/categories
 * and create a mapping file for reference
 */

import { MongoClient, GridFSBucket } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env.local") });

// MongoDB connection
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI environment variable not set");
  process.exit(1);
}

const client = new MongoClient(uri);

// Image mappings to track what we upload
const imageMappings = {
  cta: {},
  categories: {},
  logo: {},
  brands: {},
  showcase: {},
  why: {},
  instagram: {},
};

/**
 * Upload a file to GridFS
 */
async function uploadFileToGridFS(bucket, filePath, filename, category) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = getContentType(filename);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: {
        originalName: filename,
        category,
        size: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
      },
    });

    await new Promise((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    const imageId = uploadStream.id.toHexString();
    const url = `/api/images/${imageId}`;

    console.log(`✅ Uploaded ${filename} → ${url}`);
    return { imageId, url, filename };
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.message);
    return null;
  }
}

/**
 * Get content type from filename
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return types[ext] || "application/octet-stream";
}

/**
 * Upload images from a directory
 */
async function uploadDirectory(bucket, dirPath, category) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter((f) =>
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f),
  );

  console.log(`\n📁 Uploading ${imageFiles.length} images from ${category}...`);

  const results = [];
  for (const file of imageFiles) {
    const filePath = path.join(dirPath, file);
    const result = await uploadFileToGridFS(bucket, filePath, file, category);
    if (result) {
      results.push(result);
      imageMappings[category][file] = result.url;
    }
  }

  return results;
}

/**
 * Main upload function
 */
async function main() {
  console.log("🚀 Starting image upload to MongoDB GridFS...\n");

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB\n");

    const db = client.db("mj-creative-candles");
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    const publicDir = path.join(__dirname, "public");

    // Upload CTA images
    await uploadDirectory(bucket, path.join(publicDir, "CTA"), "cta");

    // Upload category images
    await uploadDirectory(
      bucket,
      path.join(publicDir, "categories"),
      "categories",
    );

    // Upload logo if it exists
    const logoDir = path.join(publicDir, "images", "logo");
    await uploadDirectory(bucket, logoDir, "logo");

    // Upload brand logos
    await uploadDirectory(bucket, path.join(publicDir, "brands"), "brands");

    // Upload showcase images
    await uploadDirectory(bucket, path.join(publicDir, "showcase"), "showcase");

    // Upload why section images
    await uploadDirectory(bucket, path.join(publicDir, "why"), "why");

    // Upload Instagram images
    await uploadDirectory(
      bucket,
      path.join(publicDir, "Instagram"),
      "instagram",
    );

    // Save mappings to a file for reference
    const mappingsPath = path.join(__dirname, "image-mappings.json");
    fs.writeFileSync(mappingsPath, JSON.stringify(imageMappings, null, 2));
    console.log(`\n📝 Image mappings saved to: image-mappings.json`);

    console.log("\n✨ Upload complete!");
    console.log("\nImage Mappings:");
    console.log(JSON.stringify(imageMappings, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

main();

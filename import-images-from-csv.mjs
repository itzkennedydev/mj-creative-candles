import fs from "fs";
import https from "https";
import sharp from "sharp";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const NEXT_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

// CSV data - paste the actual CSV content here
const csvData = `your CSV data here`;

// Parse CSV (simple parser for this use case)
function parseCSV(csv) {
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",");
  const imageIndex = headers.indexOf("Images");

  const imageUrls = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/https:\/\/[^,\s"]+\.(?:jpg|jpeg|png|gif|webp)/gi);

    if (match) {
      match.forEach((url) => {
        url = url.replace(/[">]+$/, ""); // Clean trailing chars
        imageUrls.add(url);
      });
    }
  }

  return Array.from(imageUrls);
}

// Download image from URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

// Optimize image with Sharp
async function optimizeImage(buffer) {
  return await sharp(buffer)
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();
}

// Upload to MongoDB
async function uploadToMongoDB(imageBuffer, originalUrl) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db("mj-creative-candles");
    const collection = db.collection("image_library");

    // Convert to base64 data URI
    const base64 = imageBuffer.toString("base64");
    const dataUri = `data:image/webp;base64,${base64}`;

    // Extract filename from URL
    const filename = originalUrl.split("/").pop().split("?")[0];

    const imageDoc = {
      filename: filename,
      dataUri: dataUri,
      mimeType: "image/webp",
      size: imageBuffer.length,
      uploadedAt: new Date(),
      originalUrl: originalUrl,
    };

    // Check if already exists
    const existing = await collection.findOne({ originalUrl });
    if (existing) {
      console.log(`⏭️  Skipping (already exists): ${filename}`);
      return existing;
    }

    const result = await collection.insertOne(imageDoc);
    console.log(
      `✅ Uploaded: ${filename} (${Math.round(imageBuffer.length / 1024)}KB)`,
    );
    return result;
  } finally {
    await client.close();
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting image import process...\n");

  const imageUrls = parseCSV(csvData);
  console.log(`📋 Found ${imageUrls.length} unique image URLs\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    console.log(`[${i + 1}/${imageUrls.length}] Processing: ${url}`);

    try {
      // Download
      const imageBuffer = await downloadImage(url);

      // Optimize
      const optimizedBuffer = await optimizeImage(imageBuffer);

      // Upload
      await uploadToMongoDB(optimizedBuffer, url);

      successCount++;
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error.message);
      errorCount++;
    }

    // Small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n✨ Import complete!`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
}

main().catch(console.error);

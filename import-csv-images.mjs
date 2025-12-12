import https from "https";
import sharp from "sharp";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

// Extract all image URLs from CSV Images column
const imageUrls = [
  "https://mj.svrn.agency/uchesoaj/2023/12/IMG_5571-Photoroom-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2023/12/IMG_5514-Photoroom-5.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5456-Photoroom-2-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5471-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5439-Photoroom-4.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5446-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5458-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5550-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5466-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5454-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5537-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/lime.png",
  "https://mj.svrn.agency/uchesoaj/2024/05/Photoroom_20240515_102758-Photoroom-3.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5532-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5575-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5548-Photoroom-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5561-Photoroom-1-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5565-Photoroom-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/good-intentions-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/timeout-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/odor-elimator-Photoroom-1-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/IMG_5437-Photoroom-2-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/midnight-bloom-Photoroom.png",
  "https://mj.svrn.agency/uchesoaj/2024/05/wild-blossom-s-Photoroom-1-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/wild-blossom-s-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/pink-lemonade-s-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/05/midnight-breeeze.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/08/Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/08/Team-Content-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/7aac1b72-8b1a-4e1e-9637-5601aaecd928-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/4a1db2d9-a9c4-4f32-b9d8-681f8e3a01e4-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/ed13a4fb-6469-4c84-bf88-7bd358ca409b-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/29e145a0-8f8b-47b6-9bde-77828087c30f-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/f5b43a98-055a-43a5-adb8-37e060509dfa-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/595132f5-543b-45d5-af78-414653a83008-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/e1b80521-a291-4ecb-9405-2aa55b194f72-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/04291675-8ded-4979-bbe5-e8055e352c97-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/5fbf1d68-1fc9-4f51-a161-78d2abbdd423-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/514891b5-f7df-455a-b4bc-912fc18215d2-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/29b317aa-c19a-4e47-8554-ab86e6acac38-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/47998603-f4de-4df2-9cde-c90a7df3e759-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/4cca339d-0510-4712-9087-26adfa6fdc3b-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/f07e1b8a-6fa8-493f-87e5-93e050803848-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/30ece347-7f0c-4d3e-8414-39e700cf6fa8-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/fdad4b0f-edcb-4857-827e-e2e63921e053-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/Team-Content-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/Team-Content-IMG-8050.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/strawberry-waffle-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/strawberry-waffle-box-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/pumpkin-waffle-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_7944-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_7929-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/blackberry-waffle-box-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_7930-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5673-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5663-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5660-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5662-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5658-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_5650-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/banana-cranberry-loaf-front.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-3.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-2-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-1-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-4.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/b7e54dad-6bbc-4d5a-9d40-cb6ad6be9bde-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-5.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/FullSizeRender-Photoroom-1-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_7844-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/IMG_7865-Photoroom.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/11/fall-donuts-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/11/fall-donuts-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/cin-peach-apple-loaf-front.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/cin-peach-apple-loaf-side.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/09/cin-peach-apple-loaf-front-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/11/how-we-roll.jpg",
  "https://mj.svrn.agency/uchesoaj/2024/11/how-we-roll-2.jpg",
  "https://mj.svrn.agency/uchesoaj/2025/02/IMG_5555-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2025/02/IMG_5479-Photoroom-1.jpg",
  "https://mj.svrn.agency/uchesoaj/2025/04/Photoroom_20250421_170018.jpeg",
  "https://mj.svrn.agency/uchesoaj/2025/04/Photoroom_20250421_191327.jpeg",
  "https://mj.svrn.agency/uchesoaj/2025/04/Photoroom_20250421_191342.jpeg",
  "https://mj.svrn.agency/uchesoaj/2025/04/Photoroom_20250421_191354.jpeg",
  "https://mj.svrn.agency/uchesoaj/2025/04/Photoroom_20250421_191412.jpeg",
];

// Download image from URL
async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
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

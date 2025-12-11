import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables
config({ path: ".env.local" });

interface AdminEmail {
  email: string;
  name: string;
  addedAt: Date;
  addedBy: string;
  isActive: boolean;
}

async function initializeAdminEmails() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env.local");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("stitch_orders");
    const collection = db.collection<AdminEmail>("admin_emails");

    const defaultEmails = [
      {
        email: "itskennedy.dev@gmail.com",
        name: "Kennedy",
        addedAt: new Date(),
        addedBy: "system",
        isActive: true,
      },
      {
        email: "mjcreativecandles@gmail.com",
        name: "MJ Creative Candles",
        addedAt: new Date(),
        addedBy: "system",
        isActive: true,
      },
    ];

    for (const emailData of defaultEmails) {
      const existingEmail = await collection.findOne({
        email: emailData.email,
      });

      if (!existingEmail) {
        await collection.insertOne(emailData);
        console.log(`✅ Added: ${emailData.email}`);
      } else {
        // Update to active if it exists
        await collection.updateOne(
          { email: emailData.email },
          { $set: { isActive: true, addedAt: new Date() } },
        );
        console.log(`✓  Updated: ${emailData.email}`);
      }
    }

    console.log("");
    console.log("✅ Admin emails initialized successfully!");
    console.log("");
    console.log("Authorized admin emails:");
    console.log("  • itskennedy.dev@gmail.com");
    console.log("  • mjcreativecandles@gmail.com");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log("🔧 Initializing admin emails...");
  console.log("");

  try {
    await initializeAdminEmails();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize admin emails:", error);
    process.exit(1);
  }
}

main();

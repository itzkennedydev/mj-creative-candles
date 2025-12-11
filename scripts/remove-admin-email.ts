import { config } from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables
config({ path: ".env.local" });

async function removeEmail() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env.local");
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("stitch_orders");
    const collection = db.collection("admin_emails");

    // Deactivate the email
    const result = await collection.updateOne(
      { email: "pleasestitch18@gmail.com" },
      { $set: { isActive: false } },
    );

    if (result.modifiedCount > 0) {
      console.log("✅ Removed: pleasestitch18@gmail.com");
    } else {
      console.log(
        "ℹ️  Email not found or already inactive: pleasestitch18@gmail.com",
      );
    }

    console.log("");
    console.log("✅ Email removed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.close();
  }
}

async function main() {
  console.log("🔧 Removing admin email...");
  console.log("");

  try {
    await removeEmail();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to remove email:", error);
    process.exit(1);
  }
}

main();

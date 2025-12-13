import { NextRequest, NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import { validateApiKey } from "~/lib/security";
import sharp from "sharp";

// GET: Fetch all images from library
export async function GET(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");

    const images = await db
      .collection("image_library")
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching image library:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}

// POST: Upload new image to library
export async function POST(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const tags = formData.get("tags") as string; // comma-separated

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    // Max width 2000px, quality 85%, convert to WebP for smaller size
    const optimizedBuffer = await sharp(buffer)
      .resize(2000, 2000, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Get metadata
    const metadata = await sharp(optimizedBuffer).metadata();

    // Convert to base64 for storage
    const base64 = optimizedBuffer.toString("base64");
    const dataUri = `data:image/webp;base64,${base64}`;

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");

    // Store in image library
    const imageDoc = {
      name: name || file.name,
      dataUri,
      originalName: file.name,
      mimeType: "image/webp",
      size: optimizedBuffer.length,
      width: metadata.width,
      height: metadata.height,
      tags: tags
        ? tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
      uploadedAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("image_library").insertOne(imageDoc);

    return NextResponse.json({
      success: true,
      imageId: result.insertedId.toString(),
      image: {
        _id: result.insertedId,
        ...imageDoc,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}

// DELETE: Delete image from library
export async function DELETE(request: NextRequest) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");

    // Import ObjectId if needed
    const { ObjectId } = await import("mongodb");

    // Delete the image
    const result = await db
      .collection("image_library")
      .deleteOne({ _id: new ObjectId(imageId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}

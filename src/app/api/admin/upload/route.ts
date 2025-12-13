import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "~/lib/auth";
import clientPromise from "~/lib/mongodb";

// Lazy load sharp to handle potential import errors
async function getSharp() {
  try {
    const sharpModule = await import("sharp");
    return sharpModule.default;
  } catch (error) {
    console.warn(
      "Sharp not available, images will be saved without optimization",
    );
    return null;
  }
}

// POST /api/admin/upload - Upload image to public folder
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 25MB)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 25MB limit" },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const originalExtension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    // Optimize image with sharp (if available)
    // Max dimensions: 2000px (width or height), maintain aspect ratio
    // Quality: 85% for JPEG/WebP, convert large images to WebP for better compression
    let optimizedBuffer: Buffer;
    let finalMimeType: string;
    let finalExtension: string;

    const sharp = await getSharp();

    if (sharp) {
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Determine if we should convert to WebP (for better compression)
        // Convert to WebP if original is larger than 1MB or if it's PNG/GIF
        const shouldConvertToWebP =
          buffer.length > 1024 * 1024 || // Larger than 1MB
          file.type === "image/png" ||
          file.type === "image/gif";

        // Resize if image is too large (max 2000px on longest side)
        const maxDimension = 2000;
        const needsResize =
          (metadata.width && metadata.width > maxDimension) ||
          (metadata.height && metadata.height > maxDimension);

        let processedImage = image;

        if (needsResize) {
          processedImage = processedImage.resize(maxDimension, maxDimension, {
            fit: "inside",
            withoutEnlargement: true,
          });
        }

        // Apply compression based on format
        if (shouldConvertToWebP) {
          optimizedBuffer = await processedImage
            .webp({ quality: 85 })
            .toBuffer();
          finalMimeType = "image/webp";
          finalExtension = "webp";
        } else if (file.type === "image/jpeg" || file.type === "image/jpg") {
          optimizedBuffer = await processedImage
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
          finalMimeType = "image/jpeg";
          finalExtension = "jpg";
        } else if (file.type === "image/png") {
          optimizedBuffer = await processedImage
            .png({ quality: 85, compressionLevel: 9 })
            .toBuffer();
          finalMimeType = "image/png";
          finalExtension = "png";
        } else {
          // For other formats, just resize if needed but keep original format
          optimizedBuffer = await processedImage.toBuffer();
          finalMimeType = file.type;
          finalExtension = originalExtension;
        }
      } catch (sharpError) {
        console.error("Error processing image with sharp:", sharpError);
        // Fallback: use original buffer if sharp fails
        optimizedBuffer = buffer;
        finalMimeType = file.type;
        finalExtension = originalExtension;
      }
    } else {
      // Sharp not available, use original buffer
      optimizedBuffer = buffer;
      finalMimeType = file.type;
      finalExtension = originalExtension;
    }

    // Generate filename with appropriate extension
    const baseFilename = sanitizedFilename.replace(/\.[^.]+$/, "") || "image";
    const filename = `uploads/${timestamp}_${baseFilename}.${finalExtension}`;

    // Upload to MongoDB storage
    let imageUrl: string;

    try {
      const client = await clientPromise;
      const db = client.db("mj-creative-candles");

      // Convert to base64 for storage
      const base64 = optimizedBuffer.toString("base64");
      const dataUri = `data:${finalMimeType};base64,${base64}`;

      // Store in uploads collection
      const imageDoc = {
        filename,
        dataUri,
        originalName: file.name,
        mimeType: finalMimeType,
        size: optimizedBuffer.length,
        originalSize: file.size,
        uploadedAt: new Date(),
      };

      const result = await db.collection("uploads").insertOne(imageDoc);

      // Also save to image library for easy reuse
      const libraryDoc = {
        name: file.name,
        dataUri,
        originalName: file.name,
        mimeType: finalMimeType,
        size: optimizedBuffer.length,
        tags: ["product-upload"],
        uploadedAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("image_library").insertOne(libraryDoc);

      // Return the data URI as the URL
      imageUrl = dataUri;

      console.log(
        `Image stored in MongoDB uploads (ID: ${result.insertedId}) and image_library`,
      );
    } catch (mongoError) {
      console.error("Error uploading to MongoDB:", mongoError);
      throw new Error(
        `Failed to upload file to database: ${mongoError instanceof Error ? mongoError.message : "Unknown error"}`,
      );
    }

    // Calculate compression ratio safely
    const compressionRatio =
      file.size > 0
        ? ((1 - optimizedBuffer.length / file.size) * 100).toFixed(1) + "%"
        : "0%";

    return NextResponse.json(
      {
        url: imageUrl,
        filename: filename.split("/").pop() || filename,
        mimeType: finalMimeType,
        size: optimizedBuffer.length,
        originalSize: file.size,
        compressionRatio: compressionRatio,
      },
      { status: 201 },
    );
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("Error uploading image:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    // Return more detailed error in development, generic in production
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : "Failed to upload image"
        : "Failed to upload image";

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" &&
          error instanceof Error && {
            details: error.stack,
          }),
      },
      { status: 500 },
    );
  }
}

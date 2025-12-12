import { NextRequest, NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import { validateApiKey } from "~/lib/security";
import { ObjectId } from "mongodb";

// DELETE: Remove image from library
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!validateApiKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");

    const result = await db.collection("image_library").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}

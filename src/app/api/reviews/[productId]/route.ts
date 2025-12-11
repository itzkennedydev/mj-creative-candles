import { NextRequest, NextResponse } from "next/server";
import { getReviewsByProductId } from "~/lib/reviews-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const reviews = await getReviewsByProductId(productId);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

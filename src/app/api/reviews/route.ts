import { NextRequest, NextResponse } from "next/server";
import { createReview, hasCustomerPurchasedProduct } from "~/lib/reviews-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, customerName, email, rating, title, comment } = body;

    // Validation
    if (
      !productId ||
      !customerName ||
      !email ||
      !rating ||
      !title ||
      !comment
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if customer has purchased the product
    const verified = await hasCustomerPurchasedProduct(email, productId);

    const review = await createReview({
      productId,
      customerName,
      email,
      rating,
      title,
      comment,
      verified,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}

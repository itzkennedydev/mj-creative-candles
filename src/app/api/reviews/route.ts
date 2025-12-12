import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import { ObjectId } from "mongodb";
import { cacheInvalidation } from "~/lib/cache";

export const dynamic = "force-dynamic";

interface Review {
  _id?: ObjectId;
  productId: string;
  author: string;
  email: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const reviewsCollection = db.collection<Review>("reviews");

    const reviews = await reviewsCollection
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    // Map reviews to frontend format
    const mappedReviews = reviews.map((review) => ({
      id: review._id?.toString(),
      productId: review.productId,
      author: review.author,
      rating: review.rating,
      comment: review.comment,
      verified: review.verified,
      date: review.createdAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, reviews: mappedReviews },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=1800",
          "CDN-Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=1800",
          "Vercel-CDN-Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=1800",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

// POST /api/reviews - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, author, email, rating, comment } = body;

    // Validate required fields
    if (!productId || !author || !email || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const reviewsCollection = db.collection<Review>("reviews");
    const ordersCollection = db.collection("orders");

    // Check if user has ordered this product
    const hasOrdered = await ordersCollection.findOne({
      "customer.email": email.toLowerCase(),
      "items.product.id": productId,
    });

    const verified = !!hasOrdered;

    // Create review document
    const review: Omit<Review, "_id"> = {
      productId,
      author: author.trim(),
      email: email.toLowerCase().trim(),
      rating: Number(rating),
      comment: comment.trim(),
      verified,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(review);

    if (result.insertedId) {
      // Invalidate reviews cache for this product
      cacheInvalidation.reviews(productId);

      return NextResponse.json(
        {
          success: true,
          review: {
            id: result.insertedId.toString(),
            ...review,
            date: review.createdAt.toISOString(),
          },
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 },
    );
  }
}

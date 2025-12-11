import clientPromise from "~/lib/mongodb";
import type { Review } from "~/lib/types";
import type { ObjectId } from "mongodb";

// MongoDB document type for reviews
interface ReviewDocument {
  _id?: ObjectId;
  productId: string;
  customerName: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: Date;
  helpfulCount?: number;
}

// Function to get all reviews for a product
export async function getReviewsByProductId(
  productId: string,
): Promise<Review[]> {
  try {
    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const reviewsCollection = db.collection<ReviewDocument>("reviews");

    const reviews = await reviewsCollection
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    return reviews.map((review: ReviewDocument) => ({
      id: review._id?.toString() ?? "",
      productId: review.productId,
      customerName: review.customerName,
      email: review.email,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      verified: review.verified,
      createdAt: review.createdAt,
      helpfulCount: review.helpfulCount ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
}

// Function to create a new review
export async function createReview(
  reviewData: Omit<Review, "id" | "createdAt" | "helpfulCount">,
): Promise<Review> {
  try {
    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const reviewsCollection = db.collection<ReviewDocument>("reviews");

    const newReview: Omit<ReviewDocument, "_id"> = {
      ...reviewData,
      createdAt: new Date(),
      helpfulCount: 0,
    };

    const result = await reviewsCollection.insertOne(newReview);

    if (result.insertedId) {
      // Update product's average rating and review count
      await updateProductReviewStats(reviewData.productId);

      return {
        id: result.insertedId.toString(),
        ...reviewData,
        createdAt: newReview.createdAt,
        helpfulCount: 0,
      };
    }

    throw new Error("Failed to create review");
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

// Function to update product review statistics
async function updateProductReviewStats(productId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const reviewsCollection = db.collection<ReviewDocument>("reviews");
    const productsCollection = db.collection("products");
    const { ObjectId } = await import("mongodb");

    // Calculate average rating and count
    const reviews = await reviewsCollection.find({ productId }).toArray();
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    // Update product document
    await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      {
        $set: {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount,
        },
      },
    );
  } catch (error) {
    console.error("Error updating product review stats:", error);
    throw error;
  }
}

// Function to check if a customer has purchased a product (for verified reviews)
export async function hasCustomerPurchasedProduct(
  email: string,
  productId: string,
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const ordersCollection = db.collection("orders");

    const order = await ordersCollection.findOne({
      "customer.email": email,
      "items.product.id": productId,
      status: { $in: ["processing", "shipped", "delivered", "completed"] },
    });

    return !!order;
  } catch (error) {
    console.error("Error checking customer purchase:", error);
    return false;
  }
}

// Function to increment helpful count on a review
export async function incrementHelpfulCount(
  reviewId: string,
): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const reviewsCollection = db.collection<ReviewDocument>("reviews");
    const { ObjectId } = await import("mongodb");

    const result = await reviewsCollection.updateOne(
      { _id: new ObjectId(reviewId) },
      { $inc: { helpfulCount: 1 } },
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error("Error incrementing helpful count:", error);
    return false;
  }
}

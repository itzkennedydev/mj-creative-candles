import { NextRequest, NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import type { Product } from "~/lib/types";

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

    const client = await clientPromise;
    const db = client.db("stitch_orders");
    const productsCollection = db.collection("products");
    const { ObjectId } = await import("mongodb");

    // Get the current product
    const currentProduct = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let recommendedProducts: Product[] = [];

    // Check if product has manual recommendations
    if (
      currentProduct.recommendedProducts &&
      Array.isArray(currentProduct.recommendedProducts) &&
      currentProduct.recommendedProducts.length > 0
    ) {
      // Fetch manually recommended products
      const recommendedIds = currentProduct.recommendedProducts
        .filter((id: string) => ObjectId.isValid(id))
        .map((id: string) => new ObjectId(id));

      const recommended = await productsCollection
        .find({ _id: { $in: recommendedIds } })
        .limit(4)
        .toArray();

      recommendedProducts = recommended.map((product) => ({
        id: product._id?.toString() ?? "",
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        imageId: product.imageId,
        images: product.images,
        category: product.category,
        shopType: product.shopType,
        school: product.school,
        inStock: product.inStock,
        requiresBabyClothes: product.requiresBabyClothes,
        babyClothesDeadlineDays: product.babyClothesDeadlineDays,
        recommendedProducts: product.recommendedProducts,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      }));
    }

    // If no manual recommendations or not enough, use automatic recommendations
    if (recommendedProducts.length < 4) {
      const limit = 4 - recommendedProducts.length;

      // Find similar products based on category and school
      const autoRecommended = await productsCollection
        .find({
          _id: { $ne: new ObjectId(productId) },
          $or: [
            { category: currentProduct.category },
            { school: currentProduct.school },
            { shopType: currentProduct.shopType },
          ],
          inStock: true,
        })
        .limit(limit)
        .toArray();

      const autoRecommendedProducts = autoRecommended.map((product) => ({
        id: product._id?.toString() ?? "",
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        imageId: product.imageId,
        images: product.images,
        category: product.category,
        shopType: product.shopType,
        school: product.school,
        inStock: product.inStock,
        requiresBabyClothes: product.requiresBabyClothes,
        babyClothesDeadlineDays: product.babyClothesDeadlineDays,
        recommendedProducts: product.recommendedProducts,
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      }));

      recommendedProducts = [
        ...recommendedProducts,
        ...autoRecommendedProducts,
      ];
    }

    return NextResponse.json(recommendedProducts);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended products" },
      { status: 500 },
    );
  }
}

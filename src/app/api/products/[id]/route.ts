import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import { ObjectId } from "mongodb";
import type { Product } from "~/lib/types";
import { authenticateRequest } from "~/lib/auth";
import { getCacheHeaders, memoryCache, cacheInvalidation } from "~/lib/cache";

// Cache configuration
export const revalidate = 600; // Revalidate every 10 minutes
export const dynamic = "force-dynamic";

// GET /api/products/[id] - Get a single product (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    // Check memory cache first
    const cacheKey = `product-${productId}`;
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          ...getCacheHeaders("productDetail"),
          "X-Cache": "HIT",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection<any>("products");

    const product = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Map _id to id for frontend compatibility
    const mappedProduct: Product = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice,
      image: product.image,
      imageId: product.imageId,
      images: product.images ?? [],
      productImages: product.productImages,
      category: product.category,
      shopType: product.shopType,
      school: product.school,
      inStock: product.inStock,
      stock: product.stock,
      visibility: product.visibility,
      colors: product.colors,
      requiresBabyClothes: product.requiresBabyClothes,
      babyClothesDeadlineDays: product.babyClothesDeadlineDays,
      sku: product.sku,
      slug: product.slug,
      tags: product.tags,
      featured: product.featured,
      weight: product.weight,
      dimensions: product.dimensions,
      // Scent notes
      topNotes: product.topNotes,
      middleNotes: product.middleNotes,
      baseNotes: product.baseNotes,
      scentFamily: product.scentFamily,
      burnTime: product.burnTime,
    };

    // Store in memory cache for 10 minutes
    memoryCache.set(cacheKey, mappedProduct, 10 * 60 * 1000);

    // Generate ETag for caching
    const etag = `"${productId}-${product._id.toString()}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return NextResponse.json(mappedProduct, {
      headers: {
        ...getCacheHeaders("productDetail"),
        ETag: etag,
        "X-Cache": "MISS",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Partial<Product>;
    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection<Product>("products");

    // Prepare update data
    const updateData: Partial<Product> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.imageId !== undefined) updateData.imageId = body.imageId;
    if (body.images !== undefined) updateData.images = body.images; // Include images array
    if (body.category !== undefined) updateData.category = body.category;
    if (body.shopType !== undefined) updateData.shopType = body.shopType;
    if (body.school !== undefined) updateData.school = body.school;
    if (body.inStock !== undefined) updateData.inStock = body.inStock;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.requiresBabyClothes !== undefined)
      updateData.requiresBabyClothes = body.requiresBabyClothes;
    if (body.babyClothesDeadlineDays !== undefined)
      updateData.babyClothesDeadlineDays = body.babyClothesDeadlineDays;
    // Scent notes
    if (body.topNotes !== undefined) updateData.topNotes = body.topNotes;
    if (body.middleNotes !== undefined)
      updateData.middleNotes = body.middleNotes;
    if (body.baseNotes !== undefined) updateData.baseNotes = body.baseNotes;
    if (body.scentFamily !== undefined)
      updateData.scentFamily = body.scentFamily;
    if (body.burnTime !== undefined) updateData.burnTime = body.burnTime;

    // Update product in database
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Invalidate caches for this product
    cacheInvalidation.product(productId);

    // Fetch updated product
    const updatedProduct = await productsCollection.findOne({
      _id: new ObjectId(productId),
    });

    if (updatedProduct) {
      const product: Product = {
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image: updatedProduct.image,
        imageId: updatedProduct.imageId,
        images: updatedProduct.images ?? [], // Include images array
        category: updatedProduct.category,
        shopType: updatedProduct.shopType,
        school: updatedProduct.school,
        inStock: updatedProduct.inStock,
        colors: updatedProduct.colors,
        requiresBabyClothes: updatedProduct.requiresBabyClothes,
        babyClothesDeadlineDays: updatedProduct.babyClothesDeadlineDays,
        topNotes: updatedProduct.topNotes,
        middleNotes: updatedProduct.middleNotes,
        baseNotes: updatedProduct.baseNotes,
        scentFamily: updatedProduct.scentFamily,
        burnTime: updatedProduct.burnTime,
      };

      return NextResponse.json(product);
    }

    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);

    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 },
      );
    }

    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection<Product>("products");

    // Delete product from database
    const result = await productsCollection.deleteOne({
      _id: new ObjectId(productId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Invalidate caches for this product
    cacheInvalidation.product(productId);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}

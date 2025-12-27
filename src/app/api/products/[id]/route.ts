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

    console.log("[API] GET product response:", {
      productId,
      hasImage: !!mappedProduct.image,
      imageLength: mappedProduct.image?.length,
      imagePreview: mappedProduct.image?.substring(0, 50),
    });

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
export const maxDuration = 60; // Allow up to 60 seconds for large image uploads
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

    console.log("[API] PUT /api/products/[id] - Received body:", {
      hasImage: "image" in body,
      imageValue: body.image,
      imageLength: body.image?.length,
      imageType: typeof body.image,
    });

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
    
    // Log database connection info for debugging environment sync issues
    console.log("[API] Database connection:", {
      databaseName: db.databaseName,
      environment: process.env.NODE_ENV,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 40) + "..." || "not set",
    });

    // Prepare update data
    const updateData: Partial<Product> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    // Always include image field if it's in the request (even if empty string)
    // This ensures we can clear images by setting them to empty string
    if ("image" in body) {
      // Explicitly set image - use empty string if undefined/null/empty
      const imageValue = body.image ?? "";
      updateData.image = imageValue;
      
      console.log("[API] Setting image in updateData:", {
        value: imageValue?.substring(0, 50) || "empty",
        length: imageValue?.length || 0,
        isEmpty: imageValue === "",
        isUndefined: body.image === undefined,
        originalValue: body.image?.substring(0, 50) || "undefined",
      });
    }
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

    // Log what we're about to update
    console.log("[API] About to update product:", {
      productId,
      updateDataKeys: Object.keys(updateData),
      hasImageInUpdate: "image" in updateData,
      imageValue: updateData.image?.substring(0, 50) || "empty",
      imageLength: updateData.image?.length || 0,
      fullUpdateData: JSON.stringify(updateData).substring(0, 200),
    });

    // Update product in database
    let result;
    try {
      result = await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData },
      );
    } catch (dbError) {
      console.error("[API] Database update error:", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        productId,
        updateDataKeys: Object.keys(updateData),
      });
      throw dbError; // Re-throw to be caught by outer try-catch
    }

    console.log("[API] Update result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
      updateDataImage: updateData.image?.substring(0, 50) || "empty",
      updateDataImageLength: updateData.image?.length || 0,
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!result.acknowledged) {
      console.error("[API] WARNING: Update was not acknowledged by database!");
      return NextResponse.json(
        { error: "Database update was not acknowledged" },
        { status: 500 },
      );
    }

    // If we tried to update the image but nothing was modified, log a warning
    if ("image" in updateData && result.modifiedCount === 0) {
      console.warn("[API] WARNING: Image update resulted in 0 modified documents!", {
        productId,
        imageValue: updateData.image?.substring(0, 50) || "empty",
        imageLength: updateData.image?.length || 0,
      });
    }

    // Invalidate caches for this product AND the products list
    cacheInvalidation.product(productId);
    cacheInvalidation.products(); // Also invalidate the products list cache

    // Fetch updated product directly from database to verify the write
    const updatedProduct = await productsCollection.findOne(
      { _id: new ObjectId(productId) },
      { projection: {} }, // Get all fields
    );

    if (updatedProduct) {
      console.log("[API] Fetched updated product from DB:", {
        hasImageField: "image" in updatedProduct,
        imageType: typeof updatedProduct.image,
        imageLength: updatedProduct.image?.length || 0,
        imagePreview: updatedProduct.image?.substring(0, 50) || "empty",
        allFields: Object.keys(updatedProduct),
      });

      // Verify the image was actually saved correctly
      const imageMatches =
        "image" in updateData &&
        updatedProduct.image === updateData.image;
      if ("image" in updateData && !imageMatches) {
        console.error("[API] WARNING: Image mismatch after update!", {
          expected: updateData.image?.substring(0, 50) || "empty",
          expectedLength: updateData.image?.length || 0,
          actual: updatedProduct.image?.substring(0, 50) || "empty",
          actualLength: updatedProduct.image?.length || 0,
        });
      } else if ("image" in updateData) {
        console.log("[API] ✅ Image verified in database:", {
          imageLength: updatedProduct.image?.length || 0,
          matches: imageMatches,
        });
      }

      const product: Product = {
        id: updatedProduct._id.toString(),
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image: updatedProduct.image || "", // Ensure image is always a string, default to empty
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

      console.log("[API] Returning product response:", {
        hasImage: !!product.image,
        imageLength: product.image?.length || 0,
        imagePreview: product.image?.substring(0, 50) || "empty",
        imageType: typeof product.image,
        imageIsEmpty: product.image === "",
      });

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

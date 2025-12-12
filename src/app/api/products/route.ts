import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import clientPromise from "~/lib/mongodb";
import type { Product } from "~/lib/types";
import { authenticateRequest } from "~/lib/auth";
import { getCacheHeaders, memoryCache } from "~/lib/cache";

// Cache configuration
export const revalidate = 300; // Revalidate every 5 minutes
export const dynamic = "force-dynamic"; // Allow dynamic rendering but with caching

// GET /api/products - Fetch all products (PUBLIC - for customer store)
export async function GET(request: NextRequest) {
  try {
    // Check memory cache first
    const cacheKey = "all-products";
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(
        {
          success: true,
          products: cachedData,
        },
        {
          headers: {
            ...getCacheHeaders("products"),
            "X-Cache": "HIT",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection<any>("products");

    const products = await productsCollection
      .find({})
      .sort({ sortOrder: 1, name: 1 })
      .toArray();

    // Map _id to id for frontend compatibility
    const mappedProducts = products.map((product: any) => ({
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
    }));

    // Store in memory cache for 5 minutes
    memoryCache.set(cacheKey, mappedProducts, 5 * 60 * 1000);

    // Check for ETag/If-None-Match for client-side caching
    const etag = `"${products.length}-${Date.now()}"`;
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return NextResponse.json(
      {
        success: true,
        products: mappedProducts,
      },
      {
        headers: {
          ...getCacheHeaders("products"),
          ETag: etag,
          "X-Cache": "MISS",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/products - Create a new product (ADMIN ONLY)
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

    const body = (await request.json()) as Partial<Product>;

    // Validate required fields
    if (!body.name || !body.price || body.price <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: name and price" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("mj-creative-candles");
    const productsCollection = db.collection<Omit<Product, "id">>("products");

    // Create product document
    const product: Omit<Product, "id"> = {
      name: body.name,
      description: body.description ?? "",
      price: body.price,
      image: body.image ?? "/placeholder-product.jpg",
      imageId: body.imageId,
      images: body.images ?? [], // Include images array
      category: body.category ?? "Apparel",
      shopType: body.shopType,
      school: body.school,
      inStock: body.inStock ?? true,
      colors: body.colors ?? [],
      requiresBabyClothes: body.requiresBabyClothes ?? false,
      babyClothesDeadlineDays: body.babyClothesDeadlineDays,
      // Scent notes
      topNotes: body.topNotes,
      middleNotes: body.middleNotes,
      baseNotes: body.baseNotes,
      scentFamily: body.scentFamily,
      burnTime: body.burnTime,
    };

    // Insert product into database
    const result = await productsCollection.insertOne(product);

    if (result.insertedId) {
      // Return immediately to avoid an extra database query
      const newProduct: Product = {
        id: result.insertedId.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        imageId: product.imageId,
        images: product.images ?? [],
        category: product.category,
        shopType: product.shopType,
        inStock: product.inStock,
        colors: product.colors ?? [],
        requiresBabyClothes: product.requiresBabyClothes,
        babyClothesDeadlineDays: product.babyClothesDeadlineDays,
        topNotes: product.topNotes,
        middleNotes: product.middleNotes,
        baseNotes: product.baseNotes,
        scentFamily: product.scentFamily,
        burnTime: product.burnTime,
      };

      return NextResponse.json(newProduct, { status: 201 });
    }

    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

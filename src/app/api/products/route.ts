import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import type { Product } from '~/lib/types';
import { authenticateRequest } from '~/lib/auth';

// Cache configuration
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic'; // Allow dynamic rendering but with caching

// GET /api/products - Fetch all products (PUBLIC - for customer store)
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<any>('products');

    const products = await productsCollection.find({}).sort({ sortOrder: 1, name: 1 }).toArray();
    
    // Map _id to id for frontend compatibility
    const mappedProducts = products.map((product: any) => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      imageId: product.imageId,
      images: product.images ?? [], // Include images array
      category: product.category,
      shopType: product.shopType,
      school: product.school,
      inStock: product.inStock,
      sizes: product.sizes,
      colors: product.colors,
      requiresBabyClothes: product.requiresBabyClothes,
      babyClothesDeadlineDays: product.babyClothesDeadlineDays
    }));
    
    // Check for ETag/If-None-Match for client-side caching
    const etag = `"${products.length}-${Date.now()}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }
    
    return NextResponse.json({
      success: true,
      products: mappedProducts
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
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
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json() as Partial<Product>;
    
    // Validate required fields
    if (!body.name || !body.price || body.price <= 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name and price' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Omit<Product, 'id'>>('products');

    // Create product document
    const product: Omit<Product, 'id'> = {
      name: body.name,
      description: body.description ?? '',
      price: body.price,
      image: body.image ?? '/placeholder-product.jpg',
      imageId: body.imageId,
      images: body.images ?? [], // Include images array
      category: body.category ?? 'Apparel',
      shopType: body.shopType,
      school: body.school,
      inStock: body.inStock ?? true,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      requiresBabyClothes: body.requiresBabyClothes ?? false,
      babyClothesDeadlineDays: body.babyClothesDeadlineDays
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
        sizes: product.sizes ?? [],
        colors: product.colors ?? [],
        requiresBabyClothes: product.requiresBabyClothes,
        babyClothesDeadlineDays: product.babyClothesDeadlineDays
      };
      
      return NextResponse.json(newProduct, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
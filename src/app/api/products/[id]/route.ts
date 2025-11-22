import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Product } from '~/lib/types';
import { authenticateRequest } from '~/lib/auth';

// Cache configuration
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic';

// GET /api/products/[id] - Get a single product (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<any>('products');

    const product = await productsCollection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Map _id to id for frontend compatibility
    const mappedProduct: Product = {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      imageId: product.imageId,
      images: product.images ?? [],
      category: product.category,
      shopType: product.shopType,
      school: product.school,
      inStock: product.inStock,
      sizes: product.sizes,
      colors: product.colors,
      requiresBabyClothes: product.requiresBabyClothes,
      babyClothesDeadlineDays: product.babyClothesDeadlineDays
    };

    // Generate ETag for caching
    const etag = `"${productId}-${product._id.toString()}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    return NextResponse.json(mappedProduct, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'ETag': etag,
        'X-Content-Type-Options': 'nosniff',
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Product>('products');

    // Prepare update data
    const updateData: Partial<Product> = {};
    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.imageId !== undefined) updateData.imageId = body.imageId;
    if (body.images !== undefined) updateData.images = body.images; // Include images array
    if (body.category !== undefined) updateData.category = body.category;
    if (body.shopType !== undefined) updateData.shopType = body.shopType;
    if (body.school !== undefined) updateData.school = body.school;
    if (body.inStock !== undefined) updateData.inStock = body.inStock;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.requiresBabyClothes !== undefined) updateData.requiresBabyClothes = body.requiresBabyClothes;
    if (body.babyClothesDeadlineDays !== undefined) updateData.babyClothesDeadlineDays = body.babyClothesDeadlineDays;

    // Update product in database
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch updated product
    const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(productId) });
    
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
        sizes: updatedProduct.sizes,
        colors: updatedProduct.colors,
        requiresBabyClothes: updatedProduct.requiresBabyClothes,
        babyClothesDeadlineDays: updatedProduct.babyClothesDeadlineDays
      };
      
      return NextResponse.json(product);
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { id: productId } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Product>('products');

    // Delete product from database
    const result = await productsCollection.deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

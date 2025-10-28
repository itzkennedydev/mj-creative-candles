import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';

interface ProductImage {
  id: string;
  imageId: string;
  dataUri: string;
  mimeType: string;
  filename: string;
}

interface Product {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  images: ProductImage[] | string[]; // Support both formats during migration
  isActive: boolean;
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<Product>('products');
    
    const product = await collection.findOne({ 
      _id: new ObjectId(id),
      isActive: true 
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Transform product to use 'id' instead of '_id' and create proper ProductImage objects
    const transformedProduct = (() => {
      // Handle both old format (string array) and new format (ProductImage array)
      let images: ProductImage[] = [];
      let image = '';
      let imageId: string | null = null;
      
      if (product.images && product.images.length > 0) {
        if (typeof product.images[0] === 'string') {
          // Old format: array of strings
          const stringImages = product.images as string[];
          images = stringImages.map((url: string, index: number) => ({
            id: `img_${index}`,
            imageId: `img_${index}`,
            dataUri: url,
            mimeType: 'image/jpeg',
            filename: `image_${index}.jpg`
          }));
          image = stringImages[0] || '';
          imageId = `img_0`;
        } else {
          // New format: array of ProductImage objects
          images = product.images as ProductImage[];
          image = images[0]?.dataUri || '';
          imageId = images[0]?.imageId || null;
        }
      }
      
      return {
        id: product._id?.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image,
        imageId,
        images,
        isActive: product.isActive,
        inStock: product.inStock !== undefined ? product.inStock : true,
        sizes: product.sizes || [],
        colors: product.colors || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    })();
    
    return NextResponse.json({ product: transformedProduct });
    
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<Product>('products');
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<Product>('products');
    
    // Soft delete by setting isActive to false
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

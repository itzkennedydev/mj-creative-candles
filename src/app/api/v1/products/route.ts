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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<Product>('products');
    
    // Build query
    const query: any = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get products and total count
    const [products, totalCount] = await Promise.all([
      collection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query)
    ]);
    
    // Transform products to use 'id' instead of '_id' and create proper ProductImage objects
    const transformedProducts = products.map(product => {
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
    });
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, images, inStock, sizes, colors } = body;
    
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<Product>('products');
    
    const product: Product = {
      name,
      description,
      price: parseFloat(price),
      category,
      images: images || [],
      isActive: true,
      inStock: inStock !== undefined ? inStock : true,
      sizes: sizes || [],
      colors: colors || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(product);
    
    return NextResponse.json({
      success: true,
      product: { ...product, _id: result.insertedId }
    });
    
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

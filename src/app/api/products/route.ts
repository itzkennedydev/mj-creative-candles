import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import type { Product } from '~/lib/types';

// GET /api/products - Fetch all products
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<Product>('products');

    const products = await productsCollection.find({}).toArray();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
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
      category: body.category ?? 'Apparel',
      inStock: body.inStock ?? true,
      sizes: body.sizes ?? [],
      colors: body.colors ?? []
    };

    // Insert product into database
    const result = await productsCollection.insertOne(product);

    if (result.insertedId) {
      const newProduct: Product = {
        id: result.insertedId.toString(),
        ...product
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

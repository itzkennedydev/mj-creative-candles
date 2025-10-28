import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import type { Product } from '~/lib/types';
import { authenticateRequest } from '~/lib/auth';

// GET /api/products - Fetch all products (PUBLIC - for customer store)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<any>('products');

    const products = await productsCollection.find({}).toArray();
    
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
      inStock: product.inStock,
      sizes: product.sizes,
      colors: product.colors
    }));
    
    return NextResponse.json(mappedProducts);
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
      inStock: body.inStock ?? true,
      sizes: body.sizes ?? [],
      colors: body.colors ?? []
    };

    // Insert product into database
    const result = await productsCollection.insertOne(product);

    if (result.insertedId) {
      // Fetch the created product with _id
      const createdProduct = await productsCollection.findOne({ _id: result.insertedId });
      
      if (createdProduct) {
        const newProduct: Product = {
          id: createdProduct._id.toString(),
          name: createdProduct.name,
          description: createdProduct.description,
          price: createdProduct.price,
          image: createdProduct.image,
          imageId: createdProduct.imageId,
          category: createdProduct.category,
          inStock: createdProduct.inStock,
          sizes: createdProduct.sizes,
          colors: createdProduct.colors
        };
        
        return NextResponse.json(newProduct, { status: 201 });
      }
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
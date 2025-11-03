import { config } from 'dotenv';
import clientPromise from '~/lib/mongodb';
import type { Product } from '~/lib/types';
import type { ObjectId } from 'mongodb';

// MongoDB document type for products
interface ProductDocument {
  _id?: ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  shopType?: 'spirit-wear' | 'regular-shop';
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
  requiresBabyClothes?: boolean;
  babyClothesDeadlineDays?: number;
}

// Load environment variables
config({ path: '.env.local' });

// Initial products data for seeding
const initialProducts: Omit<Product, 'id'>[] = [
  {
    name: "UTHS Spirit T-Shirt",
    description: "Show your UTHS pride with our premium spirit wear! Comfortable 50-50 cotton poly blend black t-shirt featuring custom LOS PANTHERS graphics. Perfect for games, events, and daily wear.",
    price: 22.00,
    image: "/placeholder-black-tshirt.png",
    category: "Apparel",
    shopType: "spirit-wear",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"]
  },
  {
    name: "UTHS Spirit Hoodie",
    description: "Stay warm while supporting UTHS! Our cozy 50-50 cotton poly blend black hoodie features the iconic LOS PANTHERS design. Ideal for chilly game nights and campus spirit events.",
    price: 35.00,
    image: "/placeholder-black-hoodie.png",
    category: "Apparel",
    shopType: "spirit-wear",
    inStock: true,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black"]
  }
];

export async function seedProducts() {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');

    // Check if products already exist
    const existingProducts = await productsCollection.countDocuments();
    
    if (existingProducts === 0) {
      console.log('Seeding products database...');
      
      // Insert initial products
      const result = await productsCollection.insertMany(initialProducts);
      
      console.log(`Successfully seeded ${result.insertedCount} products`);
      return result.insertedCount;
    } else {
      console.log(`Products collection already has ${existingProducts} documents`);
      return 0;
    }
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
}

// Function to get all products from database
export async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');

    const products = await productsCollection.find({}).toArray();
    
    return products.map((product: ProductDocument) => ({
      id: product._id?.toString() ?? '',
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      shopType: product.shopType,
      inStock: product.inStock,
      sizes: product.sizes,
      colors: product.colors,
      requiresBabyClothes: product.requiresBabyClothes,
      babyClothesDeadlineDays: product.babyClothesDeadlineDays
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Function to create a new product
export async function createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');

    const result = await productsCollection.insertOne(productData);
    
    if (result.insertedId) {
      return {
        id: result.insertedId.toString(),
        ...productData
      };
    }
    
    throw new Error('Failed to create product');
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Function to update a product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');
    const { ObjectId } = await import('mongodb');

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: productData }
    );

    if (result.matchedCount === 0) {
      throw new Error('Product not found');
    }

    // Fetch updated product
    const updatedProduct = await productsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!updatedProduct) {
      throw new Error('Failed to fetch updated product');
    }

    return {
      id: updatedProduct._id?.toString() ?? '',
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      image: updatedProduct.image,
      category: updatedProduct.category,
      shopType: updatedProduct.shopType,
      inStock: updatedProduct.inStock,
      sizes: updatedProduct.sizes,
      colors: updatedProduct.colors,
      requiresBabyClothes: updatedProduct.requiresBabyClothes,
      babyClothesDeadlineDays: updatedProduct.babyClothesDeadlineDays
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Function to delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');
    const { ObjectId } = await import('mongodb');

    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

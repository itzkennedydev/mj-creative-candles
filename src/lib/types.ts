export interface ProductImage {
  id: string;
  imageId: string;
  dataUri: string;
  mimeType: string;
  filename: string;
}

export interface Product {
  id: string; // Changed from number to string for MongoDB ObjectId
  name: string;
  description: string;
  price: number;
  image: string; // Primary image - Can be a URI, data URI (base64), or file path
  imageId?: string; // Optional MongoDB image document ID for primary image
  images?: ProductImage[]; // Array of additional images
  category: string;
  inStock: boolean;
  sizes?: string[];
  colors?: string[];
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(imageId: string, dataUri: string, width: number = 800): string {
  // If we have an imageId, use the optimization endpoint
  if (imageId && imageId !== '' && imageId.length > 10) {
    // Only use optimization endpoint if we have a valid MongoDB ObjectId
    // This ensures old uploads without imageId still work
    return `/api/images/optimize?id=${imageId}&width=${width}&quality=75`;
  }
  // Otherwise, return the data URI as fallback
  return dataUri;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  shipping: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
}

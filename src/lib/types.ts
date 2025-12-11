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
  shortDescription?: string; // Short description for MJ Candles
  price?: number; // For MJ Creative Candles products
  regularPrice?: number; // For MJ Candles products
  salePrice?: number; // For MJ Candles products
  image?: string; // Primary image - Can be a URI, data URI (base64), or file path
  imageId?: string; // Optional MongoDB image document ID for primary image
  images?: ProductImage[]; // Array of additional images
  productImages?: string[]; // For MJ Candles products
  category: string;
  shopType?: "spirit-wear" | "regular-shop"; // Type of shop: spirit-wear (UTHS) or regular-shop (MJ Creative Candles)
  school?: "moline" | "united-township" | "rock-island" | "north"; // For spirit-wear: Moline High School (Maroons), United Township High School (Panthers), Rock Island High School (Rocks), or Davenport North High School (Wildcats)
  inStock: boolean;
  stock?: number; // Stock quantity for MJ Candles
  visibility?: "visible" | "hidden"; // For MJ Candles products
  // sizes?: string[]; // Deprecated - candles don't have sizes
  colors?: string[];
  requiresBabyClothes?: boolean; // For Mama Keepsake Sweatshirt
  babyClothesDeadlineDays?: number; // Number of days to bring in baby clothes (default 5)
  sku?: string; // SKU for MJ Candles
  slug?: string; // URL slug for MJ Candles
  tags?: string[]; // Tags for MJ Candles
  featured?: boolean; // Featured flag for MJ Candles
  weight?: number; // Weight for MJ Candles
  dimensions?: { length: number; width: number; height: number }; // Dimensions for MJ Candles

  // Candle-specific fields
  topNotes?: string; // Top/initial scent notes
  middleNotes?: string; // Middle/heart scent notes
  baseNotes?: string; // Base/lasting scent notes
  scentFamily?: string; // Scent category (e.g., Citrus, Floral, Woody, Fresh, etc.)
  burnTime?: string; // Estimated burn time (e.g., "40-50 hours")
}

// Helper function to get optimized image URL
export function getOptimizedImageUrl(
  imageId: string,
  dataUri: string,
  width: number = 800,
): string {
  // If we have a valid ObjectId length, use the new images route with width param
  if (imageId && imageId.length === 24) {
    const safeWidth = Math.max(64, Math.min(2000, Math.floor(width)));
    return `/api/images/${imageId}?w=${safeWidth}`;
  }
  // Fallback for legacy data URIs or absolute URLs
  return dataUri;
}

// Helper function to get product price (handles both MJ Creative Candles and MJ Candles schemas)
export function getProductPrice(product: Product): number {
  return product.salePrice ?? product.price ?? product.regularPrice ?? 0;
}

export interface CartItem {
  product: Product;
  quantity: number;
  // selectedSize?: string; // Deprecated - candles don't have sizes
  selectedColor?: string;
  customColorValue?: string; // For custom color requests (when selectedColor is "Custom")
  embroideryName?: string; // Optional name for embroidery
  orderNotes?: string; // Optional notes for the order
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
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: Date;
}

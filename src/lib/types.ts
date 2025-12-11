export interface ProductImage {
  id: string;
  imageId: string;
  dataUri: string;
  mimeType: string;
  filename: string;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  email: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  verified: boolean; // True if customer purchased the product
  createdAt: Date;
  helpfulCount?: number; // Number of users who found this review helpful
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
  shopType?: "spirit-wear" | "regular-shop"; // Type of shop: spirit-wear (UTHS) or regular-shop (MJ Creative Candles)
  school?: "moline" | "united-township" | "rock-island" | "north"; // For spirit-wear: Moline High School (Maroons), United Township High School (Panthers), Rock Island High School (Rocks), or Davenport North High School (Wildcats)
  inStock: boolean;
  requiresBabyClothes?: boolean; // For Mama Keepsake Sweatshirt
  babyClothesDeadlineDays?: number; // Number of days to bring in baby clothes (default 5)
  recommendedProducts?: string[]; // Array of product IDs
  averageRating?: number; // Average rating from reviews
  reviewCount?: number; // Total number of reviews
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

export interface CartItem {
  product: Product;
  quantity: number;
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

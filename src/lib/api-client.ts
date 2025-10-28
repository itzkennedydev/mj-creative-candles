// Client-side API utilities with authentication
import { env } from '~/env.js';

// Get API key from environment (this should be set in your .env.local file)
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_API_KEY is not set. API calls may fail.');
}

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Generic API call function with authentication
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY || '',
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Specific API functions for your app
export const api = {
  // Order management
  createOrder: (orderData: any): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => 
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getOrders: (authToken: string) =>
    apiCall('/orders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }),

  getOrder: (orderId: string, authToken: string) =>
    apiCall(`/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }),

  // Stripe checkout
  createCheckoutSession: (checkoutData: any): Promise<{ sessionId?: string; url?: string; error?: string }> =>
    apiCall('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    }),

  // Products (public endpoint)
  getProducts: () =>
    apiCall('/products', {
      method: 'GET',
    }),

  // Instagram (public endpoint)
  getInstagramPosts: () =>
    apiCall('/instagram', {
      method: 'GET',
    }),

  // Authentication
  sendVerificationCode: (email: string) =>
    apiCall('/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyCode: (email: string, code: string) =>
    apiCall('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  refreshToken: (refreshToken: string) =>
    apiCall('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};

// Error handling utility
export function handleApiError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Rate limit handling
export function isRateLimitError(error: any): boolean {
  return error.message?.includes('Too many requests') || 
         error.message?.includes('Rate limit exceeded');
}

// Authentication error handling
export function isAuthError(error: any): boolean {
  return error.message?.includes('Unauthorized') || 
         error.message?.includes('Invalid') ||
         error.message?.includes('API key');
}

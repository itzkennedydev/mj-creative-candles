// Security utilities for API protection
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '~/env.js';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// API Key validation
export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  return apiKey === env.API_KEY;
}

// Rate limiting middleware
export function rateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }

  const key = `${ip}:${request.nextUrl.pathname}`;
  const current = rateLimitStore.get(key);

  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs / 1000 / 60} minutes.`,
        retryAfter: Math.ceil((current.resetTime - now) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
        }
      }
    );
  }

  current.count++;
  return null;
}

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

export function validateOrderData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate customer data
  if (!data.customer) {
    errors.push('Customer information is required');
  } else {
    const { customer } = data;
    
    if (!customer.firstName || typeof customer.firstName !== 'string' || customer.firstName.trim().length === 0) {
      errors.push('Valid first name is required');
    }
    
    if (!customer.lastName || typeof customer.lastName !== 'string' || customer.lastName.trim().length === 0) {
      errors.push('Valid last name is required');
    }
    
    if (!customer.email || !validateEmail(customer.email)) {
      errors.push('Valid email address is required');
    }
    
    if (!customer.phone || !validatePhone(customer.phone)) {
      errors.push('Valid phone number is required');
    }
  }

  // Validate shipping data
  if (!data.shipping) {
    errors.push('Shipping information is required');
  } else {
    const { shipping } = data;
    
    if (!shipping.street || typeof shipping.street !== 'string' || shipping.street.trim().length === 0) {
      errors.push('Valid street address is required');
    }
    
    if (!shipping.city || typeof shipping.city !== 'string' || shipping.city.trim().length === 0) {
      errors.push('Valid city is required');
    }
    
    if (!shipping.state || typeof shipping.state !== 'string' || shipping.state.trim().length === 0) {
      errors.push('Valid state is required');
    }
    
    if (!shipping.zipCode || typeof shipping.zipCode !== 'string' || shipping.zipCode.trim().length === 0) {
      errors.push('Valid zip code is required');
    }
    
    if (!shipping.country || typeof shipping.country !== 'string' || shipping.country.trim().length === 0) {
      errors.push('Valid country is required');
    }
  }

  // Validate items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    data.items.forEach((item: any, index: number) => {
      if (!item.productId || !item.productName || !item.quantity || !item.productPrice) {
        errors.push(`Item ${index + 1} is missing required fields`);
      }
      
      if (item.quantity < 1 || item.quantity > 10) {
        errors.push(`Item ${index + 1} quantity must be between 1 and 10`);
      }
      
      if (item.productPrice < 0 || item.productPrice > 1000) {
        errors.push(`Item ${index + 1} price must be between $0 and $1000`);
      }
    });
  }

  // Validate totals
  if (typeof data.subtotal !== 'number' || data.subtotal < 0) {
    errors.push('Valid subtotal is required');
  }
  
  if (typeof data.total !== 'number' || data.total < 0) {
    errors.push('Valid total is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// CORS configuration
export function getCorsHeaders(origin?: string | null) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    env.NEXT_PUBLIC_BASE_URL,
    // Add your production domain here
  ].filter(Boolean);

  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-admin-password',
    'Access-Control-Max-Age': '86400',
  };
}

// Security headers
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

// Request logging for security monitoring
export function logSecurityEvent(
  request: NextRequest,
  event: string,
  details?: any
) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(`[SECURITY] ${event}`, {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    path: request.nextUrl.pathname,
    method: request.method,
    details
  });
}

// Security headers middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getCorsHeaders, getSecurityHeaders, logSecurityEvent } from '~/lib/security';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow access to admin routes and API routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isApiRoute = pathname.startsWith('/api');
  const isComingSoonPage = pathname === '/coming-soon';
  const isStaticAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/images') || 
                        pathname.includes('.');

  // Redirect all public routes to coming soon page
  if (!isAdminRoute && !isApiRoute && !isComingSoonPage && !isStaticAsset) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  const response = NextResponse.next();

  // Apply security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      response.headers.set(key, String(value));
    }
  });

  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const isStripeWebhook = request.nextUrl.pathname === '/api/stripe/webhook';
    
    // Special CORS handling for Stripe webhooks
    if (isStripeWebhook) {
      // Stripe doesn't send Origin header, allow all origins for webhooks
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');
      response.headers.set('Access-Control-Max-Age', '86400');
    } else {
      const corsHeaders = getCorsHeaders(origin);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          response.headers.set(key, String(value));
        }
      });
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }

    // Skip rate limiting and security checks for Stripe webhooks (they can come in bursts)
    if (!isStripeWebhook) {
      // Apply rate limiting to API routes (except webhooks)
      const rateLimitResponse = rateLimit(request, 100, 15 * 60 * 1000); // 100 requests per 15 minutes
      if (rateLimitResponse) {
        logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED');
        return rateLimitResponse;
      }

      // Log suspicious activities (skip for webhooks - Stripe may use bot-like user agents)
      const userAgent = request.headers.get('user-agent') ?? '';
      if (userAgent.includes('bot') || userAgent.includes('crawler') || userAgent.includes('spider')) {
        logSecurityEvent(request, 'SUSPICIOUS_USER_AGENT', { userAgent });
      }

      // Check for common attack patterns
      const path = request.nextUrl.pathname;
      if (path.includes('..') || path.includes('//') || path.includes('\\')) {
        logSecurityEvent(request, 'PATH_TRAVERSAL_ATTEMPT', { path });
        return NextResponse.json(
          { error: 'Invalid request path' },
          { status: 400 }
        );
      }
    }
  }

  // Content Security Policy
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.VERCEL_ENV === 'development' ||
                       request.nextUrl.hostname === 'localhost' ||
                       request.nextUrl.hostname === '127.0.0.1';
  const connectSrc = isDevelopment 
    ? "'self' http://localhost:* https://localhost:* https://127.0.0.1:* https://www.google-analytics.com"
    : "'self' https: http: https://www.google-analytics.com";
    
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://www.instagram.com https://platform.instagram.com",
    "script-src-elem 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://www.instagram.com https://platform.instagram.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSrc}`,
    "frame-src 'self' https://www.instagram.com https://platform.instagram.com https://vercel.live",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Debug logging for development
  if (isDevelopment) {
    console.log('🔧 Development CSP:', csp);
    console.log('🔧 Hostname:', request.nextUrl.hostname);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
  }

  response.headers.set('Content-Security-Policy', csp);

  // Performance headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    // Exclude webhook route from middleware to avoid 405 errors
    // The pattern excludes: _next/static, _next/image, favicon.ico, and api/stripe/webhook
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - api/stripe/webhook (Stripe webhook endpoint)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)',
  ],
};

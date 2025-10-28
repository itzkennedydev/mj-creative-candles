// Security headers middleware
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit, getCorsHeaders, getSecurityHeaders, logSecurityEvent } from '~/lib/security';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Apply security headers
  const securityHeaders = getSecurityHeaders();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }

    // Apply rate limiting to API routes
    const rateLimitResponse = rateLimit(request, 100, 15 * 60 * 1000); // 100 requests per 15 minutes
    if (rateLimitResponse) {
      logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED');
      return rateLimitResponse;
    }

    // Log suspicious activities
    const userAgent = request.headers.get('user-agent') || '';
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

  // Content Security Policy
  const isDevelopment = process.env.NODE_ENV === 'development';
  const connectSrc = isDevelopment 
    ? "'self' http://localhost:* https://www.google-analytics.com"
    : "'self' https://www.google-analytics.com";
    
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

  response.headers.set('Content-Security-Policy', csp);

  // Performance headers
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// src/lib/auth.ts
import type { NextRequest } from 'next/server';
import { env } from '~/env.js';
import { verifyToken } from '~/lib/auth-utils';

export interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  error?: string;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for JWT token in Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // New JWT-based authentication
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded && decoded.isAdmin) {
        return {
          isAuthenticated: true,
          isAdmin: true
        };
      }
      
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: 'Invalid or expired token'
      };
    }
    
    // Fallback: Check for admin password in headers (legacy support)
    const adminPassword = request.headers.get('x-admin-password');
    
    if (adminPassword && adminPassword === env.ADMIN_PASSWORD) {
      return {
        isAuthenticated: true,
        isAdmin: true
      };
    }

    return {
      isAuthenticated: false,
      isAdmin: false,
      error: 'No authentication provided'
    };
  } catch {
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: 'Authentication failed'
    };
  }
}

export function requireAdminAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          message: 'Admin authentication required' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return handler(request, ...args);
  };
}

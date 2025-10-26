// src/lib/auth.ts
import type { NextRequest } from 'next/server';
import { env } from '~/env.js';

export interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  error?: string;
}

export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // Check for admin password in headers
    const adminPassword = request.headers.get('x-admin-password');
    
    if (!adminPassword) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: 'No authentication provided'
      };
    }

    // Verify admin password
    if (adminPassword === env.ADMIN_PASSWORD) {
      return {
        isAuthenticated: true,
        isAdmin: true
      };
    }

    return {
      isAuthenticated: false,
      isAdmin: false,
      error: 'Invalid authentication'
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

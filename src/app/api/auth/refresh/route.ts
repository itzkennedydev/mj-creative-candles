import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateAuthTokens } from '~/lib/auth-utils';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    // Verify the refresh token
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
      
      if (!decoded.email || !decoded.isAdmin) {
        return NextResponse.json(
          { error: 'Invalid refresh token' },
          { status: 401 }
        );
      }
      
      // Generate new JWT tokens
      const { token, refreshToken: newRefreshToken, expiresAt } = generateAuthTokens(decoded.email);
      
      return NextResponse.json({
        token,
        refreshToken: newRefreshToken,
        expiresAt
      });
      
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

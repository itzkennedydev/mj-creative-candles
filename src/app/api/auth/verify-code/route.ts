import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyCode } from '../send-code/route';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }
    
    // Verify the code
    if (!verifyCode(email, code)) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }
    
    // Generate JWT tokens
    const token = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    const refreshToken = jwt.sign(
      { email, isAdmin: true },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    return NextResponse.json({
      token,
      refreshToken,
      expiresAt: expiresAt.toISOString()
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { verifyVerificationCode } from '~/lib/verification-codes-db';
import { generateAuthTokens } from '~/lib/auth-utils';

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
    const isValid = await verifyVerificationCode(email, code);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 401 }
      );
    }
    
    // Generate JWT tokens
    const { token, refreshToken, expiresAt } = generateAuthTokens(email);
    
    return NextResponse.json({
      token,
      refreshToken,
      expiresAt
    });
    
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendVerificationCodeEmail } from '~/lib/email-service';

// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    // Store the code
    verificationCodes.set(email, { code, expiresAt });
    
    // Send email with verification code
    try {
      await sendVerificationCodeEmail(email, code);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send verification code' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent successfully' 
    });
    
  } catch (error) {
    console.error('Send code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to verify a code (used by verify-code endpoint)
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    return false;
  }
  
  // Check if code has expired
  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(email);
    return false;
  }
  
  // Check if code matches
  if (stored.code !== code) {
    return false;
  }
  
  // Remove the code after successful verification
  verificationCodes.delete(email);
  return true;
}

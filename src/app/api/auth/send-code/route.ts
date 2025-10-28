import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendVerificationCodeEmail } from '~/lib/email-service';
import { generateVerificationCode, storeVerificationCode } from '~/lib/verification-codes-db';

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
    const code = generateVerificationCode();
    
    // Store the code
    await storeVerificationCode(email, code);
    
    // Send email with verification code
    try {
      await sendVerificationCodeEmail(email, code);
      console.log(`✅ Verification code sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // For development, still log the code even if email fails
      console.log(`🔐 Verification code for ${email}: ${code}`);
      console.log(`⏰ Code expires in 10 minutes`);
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


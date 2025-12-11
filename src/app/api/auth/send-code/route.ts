import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sendVerificationCodeEmail } from "~/lib/email-service";
import {
  generateVerificationCode,
  storeVerificationCode,
} from "~/lib/verification-codes-db";
import { isEmailAuthorized } from "~/lib/admin-emails-db";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is authorized
    const isAuthorized = await isEmailAuthorized(normalizedEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Email not authorized",
          unauthorized: true,
          message:
            "This email is not authorized to access the admin portal. Please contact support to request access.",
        },
        { status: 403 },
      );
    }

    // Generate 6-digit verification code
    const code = generateVerificationCode();

    // Store the code
    await storeVerificationCode(normalizedEmail, code);

    // Send email with verification code
    try {
      await sendVerificationCodeEmail(normalizedEmail, code);
      console.log(`✅ Verification code sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // For development, still log the code even if email fails
      console.log(`🔐 Verification code for ${normalizedEmail}: ${code}`);
      console.log(`⏰ Code expires in 10 minutes`);
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

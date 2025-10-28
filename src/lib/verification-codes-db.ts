import clientPromise from './mongodb';

interface VerificationCode {
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

export async function storeVerificationCode(email: string, code: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<VerificationCode>('verification_codes');
    
    const expiresAt = new Date(Date.now() + (10 * 60 * 1000)); // 10 minutes
    
    // Remove any existing codes for this email
    await collection.deleteMany({ email });
    
    // Insert new code
    await collection.insertOne({
      email,
      code,
      expiresAt,
      createdAt: new Date()
    });
    
    console.log(`💾 Verification code stored in database for ${email}`);
  } catch (error) {
    console.error('Failed to store verification code in database:', error);
    throw error;
  }
}

export async function verifyVerificationCode(email: string, code: string): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<VerificationCode>('verification_codes');
    
    console.log(`🔍 Verifying code for ${email}: ${code}`);
    
    // Find the code
    const stored = await collection.findOne({ email });
    
    if (!stored) {
      console.log(`❌ No stored code found for ${email}`);
      return false;
    }
    
    console.log(`⏰ Stored code expires at: ${stored.expiresAt.toISOString()}`);
    console.log(`⏰ Current time: ${new Date().toISOString()}`);
    
    // Check if code has expired
    if (new Date() > stored.expiresAt) {
      console.log(`❌ Code expired for ${email}`);
      await collection.deleteOne({ email });
      return false;
    }
    
    // Check if code matches
    if (stored.code !== code) {
      console.log(`❌ Code mismatch for ${email}. Expected: ${stored.code}, Got: ${code}`);
      return false;
    }
    
    // Remove the code after successful verification
    console.log(`✅ Code verified successfully for ${email}`);
    await collection.deleteOne({ email });
    return true;
  } catch (error) {
    console.error('Failed to verify code in database:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired codes (can be called periodically)
export async function cleanupExpiredCodes(): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db('stitchplease');
    const collection = db.collection<VerificationCode>('verification_codes');
    
    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired verification codes`);
    }
  } catch (error) {
    console.error('Failed to cleanup expired codes:', error);
  }
}

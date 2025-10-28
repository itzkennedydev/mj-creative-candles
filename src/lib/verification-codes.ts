// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// Simple file-based persistence for development
import { promises as fs } from 'fs';
import path from 'path';

const CODES_FILE = path.join(process.cwd(), 'verification-codes.json');

async function saveCodesToFile(): Promise<void> {
  try {
    const codesArray = Array.from(verificationCodes.entries()).map(([email, data]) => ({
      email,
      code: data.code,
      expiresAt: data.expiresAt
    }));
    await fs.writeFile(CODES_FILE, JSON.stringify(codesArray, null, 2));
  } catch (error) {
    console.error('Failed to save verification codes:', error);
  }
}

async function loadCodesFromFile(): Promise<void> {
  try {
    const data = await fs.readFile(CODES_FILE, 'utf8');
    const codesArray = JSON.parse(data);
    
    // Clear expired codes
    const now = Date.now();
    codesArray.forEach((item: any) => {
      if (item.expiresAt > now) {
        verificationCodes.set(item.email, {
          code: item.code,
          expiresAt: item.expiresAt
        });
      }
    });
  } catch (error) {
    // File doesn't exist or is invalid, start fresh
    console.log('No existing verification codes file found');
  }
}

// Load codes on module initialization
loadCodesFromFile();

export async function storeVerificationCode(email: string, code: string): Promise<void> {
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
  verificationCodes.set(email, { code, expiresAt });
  await saveCodesToFile();
}

export function verifyVerificationCode(email: string, code: string): boolean {
  console.log(`🔍 Verifying code for ${email}: ${code}`);
  console.log(`📊 Total stored codes: ${verificationCodes.size}`);
  
  const stored = verificationCodes.get(email);
  
  if (!stored) {
    console.log(`❌ No stored code found for ${email}`);
    console.log(`📋 Available emails:`, Array.from(verificationCodes.keys()));
    return false;
  }
  
  console.log(`⏰ Stored code expires at: ${new Date(stored.expiresAt).toISOString()}`);
  console.log(`⏰ Current time: ${new Date().toISOString()}`);
  
  // Check if code has expired
  if (Date.now() > stored.expiresAt) {
    console.log(`❌ Code expired for ${email}`);
    verificationCodes.delete(email);
    return false;
  }
  
  // Check if code matches
  if (stored.code !== code) {
    console.log(`❌ Code mismatch for ${email}. Expected: ${stored.code}, Got: ${code}`);
    return false;
  }
  
  // Remove the code after successful verification
  console.log(`✅ Code verified successfully for ${email}`);
  verificationCodes.delete(email);
  return true;
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

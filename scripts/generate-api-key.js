#!/usr/bin/env node

/**
 * Generate a secure API key for your application
 * Run this script with: node scripts/generate-api-key.js
 */

import crypto from 'crypto';

function generateApiKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateBase64Key(length = 24) {
  return crypto.randomBytes(length).toString('base64').replace(/[+/=]/g, '');
}

console.log('🔐 Generating secure API keys for your application...\n');

const hexKey = generateApiKey(32);
const base64Key = generateBase64Key(24);

console.log('Generated API Keys:');
console.log('==================');
console.log(`Hex Key (64 chars): ${hexKey}`);
console.log(`Base64 Key (32 chars): ${base64Key}\n`);

console.log('Add these to your .env.local file:');
console.log('==================================');
console.log(`API_KEY=${hexKey}`);
console.log(`NEXT_PUBLIC_API_KEY=${hexKey}\n`);

console.log('Security Notes:');
console.log('===============');
console.log('• Store these keys securely');
console.log('• Never commit them to version control');
console.log('• Use the same key for both server and client');
console.log('• Rotate keys periodically');
console.log('• Use environment variables in production\n');

console.log('✅ API key generation complete!');

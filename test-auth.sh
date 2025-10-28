#!/bin/bash

# Test script for email verification flow
echo "🧪 Testing Email Verification Flow"
echo "=================================="

# Send verification code
echo "📤 Sending verification code..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')

echo "Response: $RESPONSE"

# Wait for user to check terminal for the code
echo ""
echo "🔍 Check your terminal for the verification code"
echo "It should look like: 📧 [EMAIL SIMULATION] Verification code for test@example.com: XXXXXX"
echo ""
read -p "Enter the verification code: " CODE

# Verify the code
echo "🔐 Verifying code: $CODE"
VERIFY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/verify-code \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"code\":\"$CODE\"}")

echo "Verification Response: $VERIFY_RESPONSE"

if [[ $VERIFY_RESPONSE == *"token"* ]]; then
  echo "✅ SUCCESS! Authentication tokens received"
else
  echo "❌ FAILED! Check the error message above"
fi

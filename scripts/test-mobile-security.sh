#!/usr/bin/env bash

# Test script to verify mobile app API security
echo "🧪 Testing Mobile App API Security"
echo "=================================="

# Test 1: Order creation with API key (should work)
echo ""
echo "Test 1: Creating order with API key..."
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-api-key: 682c7555fb854ca950331aa999686f6d923111c0e031fde2cbc1f00f9163b59a" \
  -d '{
    "customer": {
      "firstName": "Mobile",
      "lastName": "Test",
      "email": "mobile@test.com",
      "phone": "1234567890"
    },
    "shipping": {
      "street": "123 Mobile St",
      "city": "Test City",
      "state": "TS",
      "zipCode": "12345",
      "country": "US"
    },
    "items": [{
      "productId": "1",
      "productName": "Test Product",
      "productPrice": 25.00,
      "quantity": 1,
      "selectedSize": "M",
      "selectedColor": "Black"
    }],
    "subtotal": 25.00,
    "tax": 2.13,
    "shippingCost": 0.00,
    "total": 27.13,
    "paymentMethod": "card"
  }' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "Test 2: Creating order without API key (should fail)..."
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {
      "firstName": "Mobile",
      "lastName": "Test",
      "email": "mobile@test.com",
      "phone": "1234567890"
    },
    "shipping": {
      "street": "123 Mobile St",
      "city": "Test City",
      "state": "TS",
      "zipCode": "12345",
      "country": "US"
    },
    "items": [{
      "productId": "1",
      "productName": "Test Product",
      "productPrice": 25.00,
      "quantity": 1
    }],
    "subtotal": 25.00,
    "tax": 2.13,
    "shippingCost": 0.00,
    "total": 27.13,
    "paymentMethod": "card"
  }' \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "Test 3: Fetching orders with admin auth (should work)..."
# First get a token
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"itskennedy.dev@gmail.com","code":"123456"}')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  curl -X GET http://localhost:3000/api/orders \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n"
else
  echo "Failed to get admin token"
fi

echo ""
echo "Test 4: Fetching orders without auth (should fail)..."
curl -X GET http://localhost:3000/api/orders \
  -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Mobile app security tests completed!"
echo ""
echo "Expected results:"
echo "- Test 1: Status 200 (order created with API key)"
echo "- Test 2: Status 401 (order creation failed without API key)"
echo "- Test 3: Status 200 (orders fetched with admin token)"
echo "- Test 4: Status 401 (orders fetch failed without auth)"

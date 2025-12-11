# API Security Implementation Guide

## Overview
This document outlines the security measures implemented to protect your API endpoints and customer data.

## Security Features Implemented

### 1. API Key Authentication
- **Purpose**: Protects sensitive endpoints from unauthorized access
- **Implementation**: All order creation and checkout endpoints now require a valid API key
- **Header**: `x-api-key: YOUR_API_KEY`

### 2. Rate Limiting
- **Purpose**: Prevents abuse and DDoS attacks
- **Limits**: 100 requests per 15 minutes per IP address
- **Scope**: Applied to all API routes
- **Response**: Returns 429 status with retry-after header

### 3. Input Validation & Sanitization
- **Order Data**: Comprehensive validation of customer information, items, and totals
- **Email Validation**: Proper email format checking
- **Phone Validation**: International phone number format support
- **String Sanitization**: Removes potentially dangerous characters
- **Length Limits**: Prevents buffer overflow attacks

### 4. CORS Protection
- **Purpose**: Restricts cross-origin requests to authorized domains
- **Allowed Origins**: Localhost (development) and your production domain
- **Headers**: Proper CORS headers for preflight requests

### 5. Security Headers
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 6. Security Monitoring & Logging
- **Events Logged**:
  - Invalid API key attempts
  - Rate limit violations
  - Suspicious user agents
  - Path traversal attempts
  - Order creation events
  - Checkout session creation
- **Format**: Structured JSON logs with timestamps and IP addresses

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# API Security
API_KEY=your-super-secure-api-key-here-minimum-16-characters

# Existing variables (keep these)
NEXT_PUBLIC_API_KEY=your-super-secure-api-key-here-minimum-16-characters
```

## Protected Endpoints

### Order Management
- `POST /api/orders` - Create new order (requires API key)
- `GET /api/orders` - List orders (requires admin auth)
- `GET /api/orders/[id]` - Get specific order (requires admin auth)
- `PUT /api/orders/[id]` - Update order (requires admin auth)

### Payment Processing
- `POST /api/stripe/create-checkout-session` - Create checkout session (requires API key)

### Admin Endpoints (already protected)
- All `/api/admin/*` endpoints require admin authentication
- All `/api/auth/*` endpoints have appropriate validation

### Public Endpoints (intentionally unprotected)
- `GET /api/products` - Product catalog for customers
- `GET /api/instagram` - Instagram posts for display

## Frontend Integration

### Using the API Client

```typescript
import { api, handleApiError } from '~/lib/api-client';

// Create an order
try {
  const result = await api.createOrder(orderData);
  console.log('Order created:', result);
} catch (error) {
  const errorMessage = handleApiError(error);
  console.error('Order creation failed:', errorMessage);
}

// Handle rate limiting
if (isRateLimitError(error)) {
  console.log('Rate limited. Please wait before trying again.');
}
```

### Error Handling

The API client provides utilities for handling different types of errors:

- **Authentication Errors**: Invalid API key or expired tokens
- **Rate Limit Errors**: Too many requests
- **Validation Errors**: Invalid input data
- **Server Errors**: Internal server issues

## Security Best Practices

### 1. API Key Management
- Generate a strong, random API key (minimum 16 characters)
- Store securely in environment variables
- Never commit API keys to version control
- Rotate keys periodically

### 2. Monitoring
- Monitor security logs regularly
- Set up alerts for suspicious activities
- Track failed authentication attempts
- Monitor rate limit violations

### 3. Input Validation
- Always validate and sanitize user input
- Use proper data types and constraints
- Implement length limits for all text fields
- Validate email and phone formats

### 4. Error Handling
- Don't expose sensitive information in error messages
- Log security events for monitoring
- Return appropriate HTTP status codes
- Provide helpful error messages to legitimate users

## Testing Security

### Manual Testing
1. Try accessing protected endpoints without API key
2. Test with invalid API key
3. Attempt to exceed rate limits
4. Test with malformed input data
5. Verify CORS restrictions

### Automated Testing
Consider implementing automated security tests:
- API key validation tests
- Rate limiting tests
- Input validation tests
- CORS policy tests

## Deployment Considerations

### Production Environment
1. Set strong API keys in production environment variables
2. Configure proper CORS origins for your domain
3. Set up monitoring and alerting
4. Consider using a CDN with DDoS protection
5. Implement SSL/TLS certificates

### Environment Variables
Ensure these are set in your production environment:
- `API_KEY` - Your secure API key
- `NEXT_PUBLIC_API_KEY` - Same key for client-side use
- `NEXT_PUBLIC_BASE_URL` - Your production domain

## Troubleshooting

### Common Issues

1. **"Unauthorized - Valid API key required"**
   - Check that `API_KEY` is set in environment variables
   - Verify the API key is being sent in the `x-api-key` header
   - Ensure the API key matches between client and server

2. **"Too many requests"**
   - Rate limit exceeded (100 requests per 15 minutes)
   - Wait for the rate limit window to reset
   - Consider implementing request caching

3. **CORS errors**
   - Check that your domain is in the allowed origins list
   - Verify CORS headers are being set correctly
   - Ensure preflight requests are handled

4. **Input validation errors**
   - Check that all required fields are provided
   - Verify data types and formats
   - Ensure string lengths are within limits

## Security Monitoring

Monitor these logs for security events:
- `[SECURITY] INVALID_API_KEY_ATTEMPT`
- `[SECURITY] RATE_LIMIT_EXCEEDED`
- `[SECURITY] SUSPICIOUS_USER_AGENT`
- `[SECURITY] PATH_TRAVERSAL_ATTEMPT`
- `[SECURITY] ORDER_CREATED`
- `[SECURITY] CHECKOUT_SESSION_CREATED`

## Future Enhancements

Consider implementing these additional security measures:
1. **IP Whitelisting**: Restrict API access to specific IP ranges
2. **Request Signing**: Implement HMAC request signing
3. **Advanced Rate Limiting**: Per-user rate limits
4. **Security Headers**: Additional security headers like HSTS
5. **Audit Logging**: Comprehensive audit trail
6. **Intrusion Detection**: Automated threat detection

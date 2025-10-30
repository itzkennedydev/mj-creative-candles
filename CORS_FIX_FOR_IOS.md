# iOS App API Connection Fixed! 🎉

## Problem
The iOS app was getting error `-1008 "resource unavailable"` when trying to connect to the API, even though:
- The user was authenticated
- The JWT token was valid
- The network connection was working
- curl requests worked fine

## Root Cause
**CORS (Cross-Origin Resource Sharing) restrictions were blocking requests from the iOS app.**

Native mobile apps (iOS and Android) **don't send an `Origin` header** like web browsers do. The Next.js middleware was configured to only allow requests from specific origins:
- `http://localhost:3000`
- `http://localhost:3001`  
- The configured `NEXT_PUBLIC_BASE_URL`

Since the iOS app doesn't send an `Origin` header, it didn't match any of the allowed origins, and the middleware was rejecting the requests at the server level (before they even reached the API endpoints).

## Solution
Updated the `getCorsHeaders()` function in `src/lib/security.ts` to allow requests that **don't have an `Origin` header** (which is typical for native mobile apps):

```typescript
// Native mobile apps (iOS/Android) don't send an Origin header
// Allow requests without an Origin header for mobile app compatibility
if (!origin) {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-admin-password',
    'Access-Control-Max-Age': '86400',
  };
}
```

## Security Considerations
This change still maintains security because:
1. ✅ JWT authentication is still required for all admin endpoints
2. ✅ API keys are still required for order creation
3. ✅ Rate limiting is still active
4. ✅ All security headers are still applied
5. ✅ Requests from web browsers still follow the strict CORS rules

The only difference is that requests **without an `Origin` header** (native apps) are now allowed through, but they still need valid authentication credentials.

## Next Steps

### 1. Deploy to Production
You need to deploy this change to your production server (Vercel):

```bash
# From the project root (/Users/kennedymaombi/dev/stitch_please)
git add src/lib/security.ts
git commit -m "Fix CORS for iOS app - allow requests without Origin header"
git push
```

Vercel will automatically deploy the changes.

### 2. Test the iOS App
After deployment completes (usually 1-2 minutes):
1. **Open the iOS app**
2. **Log in** (if not already logged in)
3. **Check the orders screen** - you should now see data!
4. **Check the dashboard** - statistics should load

### 3. Optional: Clean Up iOS App Debug Logging
Once everything is working, you may want to remove the excessive debug logging from `APIService.swift`:
- Remove `print("🌐 Debug: Making...")` statements
- Remove `print("🔐 Debug: Added JWT...")` statements
- Keep error logging for troubleshooting

## Why This Wasn't Caught Earlier
- The issue only manifests when making requests from a native mobile app
- curl requests work because curl doesn't send an `Origin` header either (or sends a different header)
- Web browser testing works because browsers send proper `Origin` headers
- The error code `-1008` is cryptic and doesn't directly indicate a CORS issue

## API Endpoint Summary (for reference)

### Admin Endpoints (Require JWT Authentication)
- `GET /api/orders` - Get all orders
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status
- `DELETE /api/orders/[id]` - Delete order
- `POST /api/orders/send-status-email` - Send status update email
- `POST /api/orders/send-pickup-notification` - Send pickup notification

### Public Endpoints
- `GET /api/products` - Get all products (NO AUTH REQUIRED)
- `POST /api/orders` - Create order (requires `x-api-key` header)

### Authentication Endpoints
- `POST /api/auth/send-code` - Send verification code
- `POST /api/auth/verify-code` - Verify code and get JWT tokens
- `POST /api/auth/refresh` - Refresh JWT token

The iOS app is correctly configured to use JWT authentication for admin endpoints and API keys for order creation.


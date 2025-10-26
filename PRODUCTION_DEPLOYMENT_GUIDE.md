# 🚀 **Production Deployment Guide**

## 📱 **iOS App Publishing**

### **1. Configure API Endpoint**
Update the iOS app to use your production API URL instead of localhost.

**File**: `stitch_please_ios/stitch_please_ios/Configuration.swift`

```swift
// Change from:
static let baseURL = "http://127.0.0.1:3000/api"

// To your production URL:
static let baseURL = "https://your-domain.com/api"  // Your Next.js deployment URL
```

### **2. Build & Submit to App Store**
1. **Open Xcode**: Open your project
2. **Configure Signing**: Set up Apple Developer account
3. **Change Bundle ID**: To a unique identifier
4. **Archive**: Product → Archive
5. **Submit**: Upload to App Store Connect

---

## 🌐 **Backend Deployment (Next.js)**

### **Option 1: Vercel (Recommended)**

1. **Push to GitHub**:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `MONGODB_URI` (MongoDB Atlas connection string)
     - `ADMIN_PASSWORD`
     - Stripe keys (if using)

3. **Automatic Deployment**:
   - Every push to `main` branch deploys automatically
   - Vercel provides HTTPS URL automatically

### **Option 2: Other Platforms**
- **Netlify**: Similar to Vercel
- **Railway**: Easy MongoDB + Next.js deployment
- **AWS**: More control, more setup
- **Digital Ocean**: Self-managed

---

## 🗄️ **Database Setup (MongoDB)**

### **Use MongoDB Atlas (Recommended)**

1. **Create Free Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free"
   - Create account
   - Create new cluster (free tier)

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

3. **Update Environment**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stitch_orders?retryWrites=true&w=majority
   ```

4. **Migrate Existing Data** (if any):
   - Export from local MongoDB
   - Import to Atlas
   - Or start fresh in production

---

## 🔐 **Clerk Configuration for Production**

### **1. Update Clerk Settings**

In your Clerk Dashboard:
- Add your production domain
- Configure OAuth providers
- Set up session management
- Configure webhooks (optional)

### **2. Environment Variables**

**Production** (e.g., Vercel):
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**iOS App** (update Configuration.swift):
```swift
// Update Clerk publishable key to production key
clerk.configure(publishableKey: "pk_live_YOUR_PRODUCTION_KEY_HERE")
```

---

## 📋 **Environment Variables Checklist**

### **Next.js Backend (.env in production platform)**

✅ **Required**:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
MONGODB_URI=mongodb+srv://...
ADMIN_PASSWORD=your_secure_password
```

✅ **Stripe (if using)**:
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### **iOS App Configuration**

✅ **Update `Configuration.swift`**:
- Change `baseURL` to production URL
- Add production Clerk key
- Remove hardcoded passwords in production

---

## 🧪 **Testing in Production**

### **1. Test API Endpoints**

After deployment:
```bash
# Test products endpoint
curl https://your-domain.com/api/products

# Should return products JSON
```

### **2. Test iOS App**

1. Build iOS app with production URL
2. Install on physical device or TestFlight
3. Test authentication
4. Verify API calls work

### **3. Test Web App**

Visit your production URL:
- Test product browsing
- Test checkout flow
- Test admin panel (if you have web version)

---

## 🔒 **Security Considerations**

### **1. Environment Variables**
- ❌ **Never commit** `.env.local` to Git
- ✅ **Always** add to `.gitignore`
- ✅ **Use** environment variables in production platform

### **2. API Security**
- ✅ Use HTTPS only in production
- ✅ Validate all inputs
- ✅ Rate limiting (add later)
- ✅ CORS configured properly

### **3. iOS App Security**
- ❌ Don't hardcode API keys
- ✅ Use environment-based configuration
- ✅ Implement proper error handling
- ✅ Add certificate pinning (advanced)

---

## 📊 **Current Status**

### **✅ Ready for Production:**
- iOS app compiles without errors
- Next.js server running
- MongoDB structure ready
- Clerk authentication configured
- API endpoints created

### **⚠️ Needs Configuration:**
- Production MongoDB (Atlas)
- Production API URL in iOS app
- Production environment variables
- Clerk production keys
- App Store submission

---

## 🎯 **Deployment Steps Summary**

### **Quick Deploy (Recommended Path):**

1. **Set up MongoDB Atlas** (5 min)
   - Create account
   - Create cluster
   - Get connection string

2. **Deploy to Vercel** (10 min)
   - Push to GitHub
   - Import to Vercel
   - Add environment variables
   - Deploy

3. **Update iOS App** (5 min)
   - Change `baseURL` to Vercel URL
   - Update Clerk key
   - Rebuild

4. **Test & Submit to App Store** (varies)
   - Test on device
   - Archive
   - Submit to App Store

---

## 📞 **Support**

If you run into issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Check Clerk dashboard for errors
4. Check iOS app console for network errors

Your app is ready for production deployment! 🚀

# Image Upload Implementation for Stitch Please

## Overview
This implementation allows you to upload images directly to MongoDB and store them in the database, rather than using external URIs or file systems.

## What Was Implemented

### 1. Image Upload API Endpoint
**File:** `src/app/api/images/upload/route.ts`

- **POST**: Uploads images to MongoDB as base64-encoded data URIs
  - Supports: JPEG, JPG, PNG, GIF, WEBP
  - Maximum file size: 5MB
  - Stores images in the `images` collection in MongoDB
  - Returns the image ID and data URI
  
- **GET**: Retrieves images by ID from MongoDB

### 2. Updated Product Type
**File:** `src/lib/types.ts`

Added `imageId` field to the Product interface to track MongoDB image document IDs.

### 3. Updated Admin Interface
**File:** `src/app/admin/page.tsx`

- `handleEditImageUpload` now:
  - Validates file type (JPEG, PNG, GIF, WEBP)
  - Validates file size (max 5MB)
  - Uploads images to MongoDB via the upload API
  - Shows preview during upload
  - Stores the base64 data URI in the product
  
### 4. Updated Product API Routes
**Files:** 
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/route.ts`

Both routes now handle the `imageId` field for products.

## How It Works

1. **Image Upload Process:**
   - User selects an image file in the admin panel
   - File is validated (type and size)
   - Image is converted to base64 and stored in MongoDB
   - Base64 data URI is returned and stored in the product document
   - Image can be displayed directly from the database

2. **Image Storage:**
   - Images are stored in MongoDB's `images` collection
   - Each image document contains:
     - `data`: Base64 data URI (data:image/type;base64,encoded-data)
     - `mimeType`: Image MIME type
     - `filename`: Original filename
     - `size`: File size in bytes
     - `uploadedAt`: Upload timestamp

3. **Displaying Images:**
   - Images are stored as data URIs in the product `image` field
   - These can be used directly in `<img>` tags or Next.js `Image` components
   - No external URLs or file systems needed

## Usage

### For Admins:
1. Go to Admin Panel → Products
2. Click "Create New Product" or edit an existing product
3. Click "Upload Image" button
4. Select a PNG, JPG, or other supported image file
5. Image will be uploaded and stored in MongoDB
6. Save the product

### Supported File Types:
- JPEG/JPG
- PNG
- GIF
- WEBP

### File Size Limit:
- Maximum: 5MB

## Benefits

1. **Self-Contained**: All data (including images) is in MongoDB
2. **No External Dependencies**: No need for AWS S3, Cloudinary, or other image services
3. **Simple Setup**: Works out of the box with your existing MongoDB setup
4. **Desktop Support**: Upload directly from desktop web interface
5. **Secure**: Admin-only upload functionality

## Database Structure

### Images Collection
```javascript
{
  _id: ObjectId,
  data: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  mimeType: "image/jpeg",
  filename: "product-image.jpg",
  size: 150000,
  uploadedAt: ISODate("2024-01-01T00:00:00.000Z")
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: "Product Name",
  description: "Product description",
  price: 29.99,
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  imageId: "507f1f77bcf86cd799439011",
  category: "Apparel",
  inStock: true,
  sizes: ["S", "M", "L"],
  colors: ["Black", "White"]
}
```

## Notes

- Base64 encoding increases file size by approximately 33%
- For very large images, consider compression before upload
- MongoDB document size limit is 16MB, so images stored this way should be under ~12MB
- The Next.js Image component supports data URIs natively

## Environment Variables

No additional environment variables needed - uses existing:
- `MONGODB_URI`: Your MongoDB connection string
- `ADMIN_PASSWORD`: For admin authentication
- `NEXT_PUBLIC_ADMIN_PASSWORD`: For client-side admin checks


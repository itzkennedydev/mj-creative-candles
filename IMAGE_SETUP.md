# Image Upload Instructions

## Logo Setup

The logo file is currently missing. Please follow these steps to add your logo:

1. **Add your logo file** to `/public/images/logo/` directory
   - Recommended name: `MJLogo.png`
   - Recommended format: PNG with transparent background
   - Recommended size: At least 500x500px for high-quality display

2. **Upload logo to database:**

   ```bash
   node upload-images-to-db.mjs
   ```

3. **Update image config** at `/src/lib/image-config.ts`:
   - Replace the placeholder logo URL with the database URL from the upload script output

## Current Image Status

✅ **CTA Images** - Uploaded to MongoDB GridFS

- Image 1: `/api/images/693a8546aed878d049b16af7`
- Image 2: `/api/images/693a8547aed878d049b16afa`
- Image 3: `/api/images/693a8547aed878d049b16afd`

✅ **Category Images** - Uploaded to MongoDB GridFS

- Accessories: `/api/images/693a8548aed878d049b16b02`
- Hats: `/api/images/693a8548aed878d049b16b13`
- Spirit Wear: `/api/images/693a8549aed878d049b16b21`
- Tops: `/api/images/693a854aaed878d049b16b36`

⚠️ **Logo** - Not yet uploaded

- Placeholder: `/images/logo/MJLogo.png`

## How Images Work

All images are now stored in MongoDB GridFS and served via the `/api/images/[id]` endpoint. This approach:

- Keeps images out of your git repository
- Provides better scalability
- Allows easier image management
- Reduces deployment bundle size

The `image-config.ts` file serves as a central reference for all image URLs used throughout the application.

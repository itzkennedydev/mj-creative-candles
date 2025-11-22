import { config } from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import type { Product } from '../src/lib/types.js';

interface ProductImage {
  id: string;
  imageId: string;
  dataUri: string;
  mimeType: string;
  filename: string;
}

interface ProductDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  imageId?: string;
  images?: (string | ProductImage)[];
  category?: string;
  shopType?: 'spirit-wear' | 'regular-shop';
  school?: 'moline' | 'united-township' | 'rock-island' | 'north';
  inStock?: boolean;
  sizes?: string[];
  colors?: string[];
  requiresBabyClothes?: boolean;
  babyClothesDeadlineDays?: number;
}

async function combineMolineBeanies() {
  try {
    // Load environment variables
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const productsCollection = db.collection<ProductDocument>('products');

    // Find the two existing Moline Beanie products
    const molineBeanie = await productsCollection.findOne({ 
      name: "Moline Beanie"
    });

    const molineBlackBeanie = await productsCollection.findOne({ 
      name: "Moline Black Beanie"
    });

    if (!molineBeanie && !molineBlackBeanie) {
      console.log('❌ No Moline Beanie products found!');
      await client.close();
      return;
    }

    console.log('Found products:');
    if (molineBeanie) {
      console.log(`  - Moline Beanie (ID: ${molineBeanie._id})`);
    }
    if (molineBlackBeanie) {
      console.log(`  - Moline Black Beanie (ID: ${molineBlackBeanie._id})`);
    }

    // Determine which product to keep (prefer the one with more complete data)
    const baseProduct = molineBeanie || molineBlackBeanie;
    const otherProduct = molineBeanie && molineBlackBeanie 
      ? (molineBeanie === baseProduct ? molineBlackBeanie : molineBeanie)
      : null;

    // Collect all images
    const images: ProductImage[] = [];
    
    // Add primary image from base product
    if (baseProduct.image) {
      images.push({
        id: `img_${Date.now()}_0`,
        imageId: baseProduct.imageId || '',
        dataUri: baseProduct.image,
        mimeType: 'image/png',
        filename: baseProduct.image.includes('Beanie.png') ? 'Beanie.png' : 
                  baseProduct.image.includes('MolineBlack') ? 'MolineBlack.jpg' : 
                  'beanie.png'
      });
    }

    // Add images from base product's images array
    if (baseProduct.images && Array.isArray(baseProduct.images)) {
      baseProduct.images.forEach((img, idx: number) => {
        if (typeof img === 'string') {
          images.push({
            id: `img_${Date.now()}_${idx + 1}`,
            imageId: '',
            dataUri: img,
            mimeType: 'image/png',
            filename: img.includes('Beanie') ? 'Beanie.png' : 
                      img.includes('MolineBlack') ? 'MolineBlack.jpg' : 
                      img.includes('BlackonBlack') ? 'BlackonBlack.png' : 
                      `image_${idx}.png`
          });
        } else if (img && 'dataUri' in img && typeof img.dataUri === 'string') {
          images.push({
            id: img.id || `img_${Date.now()}_${idx + 1}`,
            imageId: img.imageId || '',
            dataUri: img.dataUri,
            mimeType: img.mimeType || 'image/png',
            filename: img.filename || `image_${idx}.png`
          });
        }
      });
    }

    // Add primary image from other product if different
    if (otherProduct && otherProduct.image) {
      const imageExists = images.some(img => 
        img.dataUri === otherProduct.image || 
        img.filename === (otherProduct.image.includes('MolineBlack') ? 'MolineBlack.jpg' : '')
      );
      
      if (!imageExists) {
        images.push({
          id: `img_${Date.now()}_${images.length}`,
          imageId: otherProduct.imageId || '',
          dataUri: otherProduct.image,
          mimeType: 'image/jpeg',
          filename: otherProduct.image.includes('MolineBlack') ? 'MolineBlack.jpg' : 'beanie.jpg'
        });
      }
    }

    // Add images from other product's images array
    if (otherProduct && otherProduct.images && Array.isArray(otherProduct.images)) {
      otherProduct.images.forEach((img, idx: number) => {
        if (typeof img === 'string') {
          const imageExists = images.some(existingImg => existingImg.dataUri === img);
          if (!imageExists) {
            images.push({
              id: `img_${Date.now()}_${images.length}`,
              imageId: '',
              dataUri: img,
              mimeType: 'image/jpeg',
              filename: img.includes('MolineBlack') ? 'MolineBlack.jpg' : `image_${idx}.jpg`
            });
          }
        } else if (img && 'dataUri' in img && typeof img.dataUri === 'string') {
          const imageExists = images.some(existingImg => existingImg.dataUri === img.dataUri);
          if (!imageExists) {
            images.push({
              id: img.id || `img_${Date.now()}_${images.length}`,
              imageId: img.imageId || '',
              dataUri: img.dataUri,
              mimeType: img.mimeType || 'image/jpeg',
              filename: img.filename || `image_${idx}.jpg`
            });
          }
        }
      });
    }

    // Ensure we have the three required images with proper filenames for color matching
    const imagePaths = [
      { path: '/Beanie.png', filename: 'Beanie.png', color: 'Moline' },
      { path: '/MolineBlack.jpg', filename: 'MolineBlack.jpg', color: 'Moline Black' },
      { path: '/BlackonBlack.png', filename: 'BlackonBlack.png', color: 'Black on Black' }
    ];

    // Add missing images if they're not already in the array
    imagePaths.forEach(({ path, filename, color }) => {
      const exists = images.some(img => 
        img.dataUri === path || 
        img.filename === filename ||
        img.filename.includes(filename.replace('.png', '').replace('.jpg', ''))
      );
      if (!exists) {
        images.push({
          id: `img_${Date.now()}_${images.length}`,
          imageId: '',
          dataUri: path,
          mimeType: path.includes('.jpg') ? 'image/jpeg' : 'image/png',
          filename: filename
        });
      } else {
        // Update filename if it exists but has wrong name
        const existingImg = images.find(img => 
          img.dataUri === path || 
          img.filename.includes(filename.replace('.png', '').replace('.jpg', ''))
        );
        if (existingImg && existingImg.filename !== filename) {
          existingImg.filename = filename;
        }
      }
    });

    // Set primary image (use Beanie.png as primary)
    const primaryImage = images.find(img => img.filename.includes('Beanie.png')) || 
                        images.find(img => img.filename.includes('Beanie')) ||
                        images[0];

    // Define colors - matching image filenames
    const colors = ["Moline", "Moline Black", "Black on Black"];

    // Create the combined product
    const combinedProduct: Omit<Product, 'id'> = {
      name: "Moline Beanie",
      description: baseProduct.description || "Show your Maroons pride with this cozy knitted beanie! Features a maroon and black striped design with a pom-pom on top and an embroidered 'M' logo on the cuff. Perfect for chilly game nights and campus spirit events.",
      price: baseProduct.price || 25.00,
      image: primaryImage?.dataUri || '/Beanie.png',
      imageId: primaryImage?.imageId,
      images: images.filter(img => img.dataUri !== primaryImage?.dataUri), // Other images in array
      category: baseProduct.category || "Accessories",
      shopType: baseProduct.shopType || "spirit-wear",
      school: baseProduct.school || "moline",
      inStock: baseProduct.inStock !== false && (otherProduct?.inStock !== false ?? true),
      sizes: baseProduct.sizes || ["One Size"],
      colors: colors,
      requiresBabyClothes: baseProduct.requiresBabyClothes || false,
      babyClothesDeadlineDays: baseProduct.babyClothesDeadlineDays
    };

    console.log('\n📦 Combined Product:');
    console.log(`  Name: ${combinedProduct.name}`);
    console.log(`  Price: $${combinedProduct.price}`);
    console.log(`  Colors: ${combinedProduct.colors?.join(', ')}`);
    console.log(`  Images: ${images.length} total`);
    console.log(`  Primary Image: ${combinedProduct.image}`);

    // Check if combined product already exists
    const existingCombined = await productsCollection.findOne({ 
      name: "Moline Beanie",
      colors: { $size: 3 }
    });

    if (existingCombined) {
      console.log('\n⚠️  Combined product already exists. Updating it...');
      
      // Update existing product
      const updateResult = await productsCollection.updateOne(
        { _id: existingCombined._id },
        { $set: combinedProduct }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('✅ Successfully updated combined product!');
        
        // Delete old products if they exist and are different
        const idsToDelete: ObjectId[] = [];
        if (molineBeanie && molineBeanie._id.toString() !== existingCombined._id.toString()) {
          idsToDelete.push(molineBeanie._id);
        }
        if (molineBlackBeanie && molineBlackBeanie._id.toString() !== existingCombined._id.toString()) {
          idsToDelete.push(molineBlackBeanie._id);
        }

        if (idsToDelete.length > 0) {
          const deleteResult = await productsCollection.deleteMany({
            _id: { $in: idsToDelete }
          });
          console.log(`✅ Deleted ${deleteResult.deletedCount} old product(s)`);
        }
      } else {
        console.log('⚠️  No changes made to existing product');
      }
    } else {
      // Insert new combined product
      const insertResult = await productsCollection.insertOne(combinedProduct);

      if (insertResult.insertedId) {
        console.log('\n✅ Successfully created combined product!');
        console.log(`Product ID: ${insertResult.insertedId.toString()}`);

        // Delete old products
        const idsToDelete: ObjectId[] = [];
        if (molineBeanie) idsToDelete.push(molineBeanie._id);
        if (molineBlackBeanie) idsToDelete.push(molineBlackBeanie._id);

        if (idsToDelete.length > 0) {
          const deleteResult = await productsCollection.deleteMany({
            _id: { $in: idsToDelete }
          });
          console.log(`✅ Deleted ${deleteResult.deletedCount} old product(s)`);
        }
      } else {
        console.error('❌ Failed to create combined product');
      }
    }

    await client.close();
  } catch (error) {
    console.error('Error combining products:', error);
    throw error;
  }
}

// Run the script
combineMolineBeanies()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });


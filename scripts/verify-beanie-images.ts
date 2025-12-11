/**
 * Script to verify and display the exact image paths for the Beanie product
 * Run with: npx tsx scripts/verify-beanie-images.ts
 */

import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function verifyBeanieImages() {
  try {
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find the Beanie product
    const beanie = await productsCollection.findOne({ 
      name: "Beanie",
      category: "Hats"
    });

    if (!beanie) {
      console.log('❌ Beanie product not found!');
      await client.close();
      return;
    }

    console.log('📦 Beanie Product Found\n');
    console.log('Colors:', beanie.colors);
    console.log('\nImage Mapping:');
    console.log('─'.repeat(70));
    
    const colors = beanie.colors || [];
    const images = beanie.images || [];
    
    // allImages in the frontend is: [primary, ...images]
    const allImages = [
      { src: beanie.image, isPrimary: true },
      ...images.map((img: any) => ({ 
        src: typeof img === 'string' ? img : img.dataUri, 
        isPrimary: false 
      }))
    ];
    
    console.log('\nallImages array (as seen by frontend):');
    allImages.forEach((img, i) => {
      console.log(`  [${i}] ${img.src} ${img.isPrimary ? '(PRIMARY)' : ''}`);
    });
    
    console.log('\n\nColor to Image Expected Mapping:');
    console.log('─'.repeat(70));
    
    colors.forEach((color: string, colorIndex: number) => {
      const colorLower = color.toLowerCase();
      let matchedIndex = -1;
      let matchedImage = 'NOT FOUND';
      
      for (let i = 0; i < allImages.length; i++) {
        const imageSrcLower = (allImages[i].src || '').toLowerCase();
        
        // Same logic as the fixed code
        if (colorLower.includes('forest green') && imageSrcLower.includes('forest')) { matchedIndex = i; break; }
        if (colorLower.includes('gold') && colorLower.includes('white') && imageSrcLower.includes('gold')) { matchedIndex = i; break; }
        if (colorLower.includes('icon grey') && imageSrcLower.includes('icon')) { matchedIndex = i; break; }
        if (colorLower.includes('maroon') && imageSrcLower.includes('maroon')) { matchedIndex = i; break; }
        if (colorLower.includes('pink raspberry') && imageSrcLower.includes('pink')) { matchedIndex = i; break; }
        if (colorLower.includes('purple') && imageSrcLower.includes('purple')) { matchedIndex = i; break; }
        if (colorLower.includes('red') && colorLower.includes('black') && !colorLower.includes('royal') && imageSrcLower.includes('red:black')) { matchedIndex = i; break; }
        if (colorLower.includes('red') && colorLower.includes('royal') && imageSrcLower.includes('red:royal')) { matchedIndex = i; break; }
        if (colorLower.includes('true royal') && imageSrcLower.includes('true')) { matchedIndex = i; break; }
      }
      
      if (matchedIndex >= 0) {
        matchedImage = allImages[matchedIndex].src;
      }
      
      const status = matchedIndex >= 0 ? '✅' : '❌';
      console.log(`${status} "${color}" → [${matchedIndex}] ${matchedImage}`);
    });

    await client.close();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

verifyBeanieImages()
  .then(() => {
    console.log('\n\n✅ Verification completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


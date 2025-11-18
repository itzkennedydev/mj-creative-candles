import { config } from 'dotenv';
import { MongoClient } from 'mongodb';

async function updateWildcatsImages() {
  try {
    // Load environment variables
    config({ path: '.env.local' });

    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local');
    }

    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('stitch_orders');
    const productsCollection = db.collection('products');

    // Find all Wildcats products (school: 'north')
    const wildcatsProducts = await productsCollection.find({ 
      school: 'north'
    }).toArray();

    if (wildcatsProducts.length === 0) {
      console.log('⚠️  No Wildcats products found. You may need to create them first.');
      await client.close();
      return;
    }

    console.log(`Found ${wildcatsProducts.length} Wildcats product(s):`);
    wildcatsProducts.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p._id.toString()})`);
    });

    // Update products based on their names/colors
    let updatedCount = 0;

    for (const product of wildcatsProducts) {
      const productName = product.name.toLowerCase();
      const productColors = (product.colors || []).map((c: string) => c.toLowerCase());
      
      // Check if it's a blue product (crewneck, sweatshirt, or has blue color)
      if (productName.includes('blue') || productName.includes('crewneck') || productName.includes('sweatshirt') || productColors.includes('blue')) {
        const result = await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              image: "/WildcatsBlue.jpeg"
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${product.name} - Set image to /WildcatsBlue.jpeg`);
          updatedCount++;
        }
      }
      // Check if it's a black product (t-shirt, or has black color)
      else if (productName.includes('black') || productName.includes('t-shirt') || productName.includes('tshirt') || productColors.includes('black')) {
        const result = await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              image: "/WildcatsBlack.jpeg"
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${product.name} - Set image to /WildcatsBlack.jpeg`);
          updatedCount++;
        }
      }
      // If we can't determine, update the first one to blue and check if we need to create a black variant
      else {
        // Default to blue for the first product if we can't determine
        const result = await productsCollection.updateOne(
          { _id: product._id },
          {
            $set: {
              image: "/WildcatsBlue.jpeg"
            }
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Updated ${product.name} - Set image to /WildcatsBlue.jpeg (default)`);
          updatedCount++;
        }
      }
    }

    // Check if we need to create a black variant
    const hasBlackVariant = wildcatsProducts.some(p => {
      const name = p.name.toLowerCase();
      const colors = (p.colors || []).map((c: string) => c.toLowerCase());
      return name.includes('black') || colors.includes('black');
    });

    if (!hasBlackVariant && wildcatsProducts.length > 0) {
      // Find a blue product to use as template for black variant
      const blueProduct = wildcatsProducts.find(p => {
        const name = p.name.toLowerCase();
        const colors = (p.colors || []).map((c: string) => c.toLowerCase());
        return name.includes('blue') || name.includes('crewneck') || name.includes('sweatshirt') || colors.includes('blue');
      }) || wildcatsProducts[0];

      // Create black variant
      const blackVariant = {
        name: blueProduct.name.replace(/blue/gi, 'Black').replace(/crewneck/gi, 'T-Shirt').replace(/sweatshirt/gi, 'T-Shirt'),
        description: blueProduct.description.replace(/blue/gi, 'black').replace(/crewneck/gi, 't-shirt').replace(/sweatshirt/gi, 't-shirt'),
        price: blueProduct.price,
        image: "/WildcatsBlack.jpeg",
        category: blueProduct.category || "Apparel",
        shopType: blueProduct.shopType || "spirit-wear",
        school: "north",
        inStock: blueProduct.inStock !== undefined ? blueProduct.inStock : true,
        sizes: blueProduct.sizes || ["S", "M", "L", "XL", "XXL", "3XL"],
        colors: ["Black"]
      };

      const insertResult = await productsCollection.insertOne(blackVariant);
      if (insertResult.insertedId) {
        console.log(`✅ Created black variant: ${blackVariant.name} (ID: ${insertResult.insertedId.toString()})`);
        console.log(`   - Image: /WildcatsBlack.jpeg`);
        updatedCount++;
      }
    }

    if (updatedCount === 0) {
      console.log('⚠️  No changes made (products may already be updated)');
    } else {
      console.log(`\n✅ Successfully updated ${updatedCount} product(s)!`);
    }

    await client.close();
  } catch (error) {
    console.error('Error updating products:', error);
    throw error;
  }
}

// Run the script
updateWildcatsImages()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });


import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';
import { ObjectId } from 'mongodb';

interface ImageDocument {
  _id?: unknown;
  data: string;
  mimeType: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

// GET - Retrieve image by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    const image = await imagesCollection.findOne({ _id: new ObjectId(id) });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: image._id?.toString(),
      dataUri: image.data,
      mimeType: image.mimeType,
      filename: image.filename,
      size: image.size,
      uploadedAt: image.uploadedAt
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

// DELETE - Delete image by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    // Check if image exists
    const image = await imagesCollection.findOne({ _id: new ObjectId(id) });
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete the image
    await imagesCollection.deleteOne({ _id: new ObjectId(id) });

    // Also remove this image from any products that reference it
    const productsCollection = db.collection('products');
    
    // Find products that have this image as primary
    const affectedProducts = await productsCollection.find({
      imageId: id
    }).toArray();

    // Update products that had this as primary image
    for (const product of affectedProducts) {
      if (product.images && product.images.length > 0) {
        // Promote first additional image to primary
        const nextImage = product.images[0];
        await productsCollection.updateOne(
          { _id: product._id },
          { 
            $set: { 
              image: nextImage.dataUri,
              imageId: nextImage.imageId
            },
            $pull: { images: { imageId: nextImage.imageId } }
          }
        );
      } else {
        // Clear primary image
        await productsCollection.updateOne(
          { _id: product._id },
          { $unset: { imageId: "", image: "" } }
        );
      }
    }

    // Remove from images array for all products
    await productsCollection.updateMany(
      {},
      { $pull: { images: { imageId: id } } }
    );

    return NextResponse.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}


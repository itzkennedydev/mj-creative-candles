import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';

interface ImageDocument {
  _id?: unknown;
  data: string;
  mimeType: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

// GET /api/images/gallery - Get all images for gallery (ADMIN ONLY)
export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const skip = (page - 1) * limit;

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    // Get total count
    const total = await imagesCollection.countDocuments();

    // Get images with pagination
    const images = await imagesCollection
      .find({})
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const mappedImages = images.map((image) => ({
      id: image._id?.toString(),
      dataUri: image.data,
      mimeType: image.mimeType,
      filename: image.filename,
      size: image.size,
      uploadedAt: image.uploadedAt
    }));

    return NextResponse.json({
      images: mappedImages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching image gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image gallery' },
      { status: 500 }
    );
  }
}


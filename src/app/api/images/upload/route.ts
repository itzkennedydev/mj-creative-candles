import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';
import { ObjectId } from 'mongodb';

interface ImageDocument {
  _id?: ObjectId;
  data: string; // base64 encoded image
  mimeType: string; // e.g., 'image/jpeg', 'image/png'
  filename: string;
  size: number; // file size in bytes
  uploadedAt: Date;
}

// POST /api/images/upload - Upload an image (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    const imageDoc: ImageDocument = {
      data: dataUri,
      mimeType: file.type,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date()
    };

    const result = await imagesCollection.insertOne(imageDoc);

    return NextResponse.json({
      id: result.insertedId.toString(),
      dataUri,
      mimeType: file.type,
      filename: file.name,
      size: file.size
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// GET /api/images/upload - Get an image by ID (PUBLIC)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    const image = await imagesCollection.findOne({ _id: new ObjectId(id) });

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: image._id?.toString(),
      dataUri: image.data,
      mimeType: image.mimeType,
      filename: image.filename,
      size: image.size
    });

  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}


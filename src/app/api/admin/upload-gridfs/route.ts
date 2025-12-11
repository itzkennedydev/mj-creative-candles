import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';
import { authenticateRequest } from '~/lib/auth';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/upload-gridfs - Upload image to MongoDB GridFS
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.' }, { status: 400 });
    }

    // Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const client = await clientPromise;
    const db = client.db('mj-creative-candles');
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    const uploadStream = bucket.openUploadStream(sanitizedFilename, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        size: buffer.length,
        uploadedAt: new Date().toISOString(),
      },
    });

    await new Promise<void>((resolve, reject) => {
      Readable.from(buffer).pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve());
    });

    const imageId = uploadStream.id as ObjectId;
    const url = `/api/images/${imageId.toHexString()}`;

    return NextResponse.json({ url, imageId: imageId.toHexString(), filename: sanitizedFilename, mimeType: file.type, size: buffer.length }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image to GridFS:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

// Some environments/proxies might use PUT for uploads; support it as an alias
export async function PUT(request: NextRequest) {
  return POST(request);
}



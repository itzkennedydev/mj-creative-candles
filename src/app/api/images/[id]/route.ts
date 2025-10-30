import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/images/[id] - Stream image from GridFS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid image id' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const objectId = new ObjectId(id);

    // Get file info to set headers
    const files = await db.collection('uploads.files').find({ _id: objectId }).limit(1).toArray();
    if (!files.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const file = files[0] as any;
    const contentType = file.contentType || file.metadata?.contentType || 'application/octet-stream';

    const stream = bucket.openDownloadStream(objectId);

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk));
        stream.on('end', () => controller.close());
        stream.on('error', (err) => controller.error(err));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(readableStream as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image from GridFS:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}



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
    const db = client.db('mj-creative-candles');
    const bucket = new GridFSBucket(db, { bucketName: 'uploads' });
    const objectId = new ObjectId(id);

    // Get file info to set headers (optimized: only fetch metadata)
    const file = await db.collection('uploads.files').findOne({ _id: objectId });
    if (!file) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const originalContentType = (file as any).contentType || (file as any).metadata?.contentType || 'image/jpeg';
    const uploadDate = (file as any).uploadDate || new Date();

    // Check ETag before processing (early return for cached requests)
    const etag = `W/"${(file as any).length}-${new Date(uploadDate).getTime()}"`;
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304 });
    }

    // Read the file into a buffer (GridFS streams -> Buffer)
    // Optimized: Use stream directly instead of accumulating chunks
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      bucket.openDownloadStream(objectId)
        .on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });
    let buffer = Buffer.concat(chunks);

    // Optional resizing and format negotiation
    const url = new URL(request.url);
    const widthParam = url.searchParams.get('w');
    const targetWidth = widthParam ? Math.max(64, Math.min(2000, parseInt(widthParam))) : undefined;

    // Check Accept header for webp/avif support
    const accept = request.headers.get('accept') || '';
    const preferAvif = accept.includes('image/avif');
    const preferWebp = accept.includes('image/webp');

    let contentType = originalContentType;
    try {
      // Use dynamic import to avoid hard dependency issues
      const sharp = (await import('sharp')).default;
      let img = sharp(buffer, { failOnError: false });
      if (targetWidth) {
        img = img.resize({ width: targetWidth, withoutEnlargement: true });
      }
      if (preferAvif) {
        img = img.avif({ quality: 70 });
        contentType = 'image/avif';
      } else if (preferWebp) {
        img = img.webp({ quality: 75 });
        contentType = 'image/webp';
      } else if (!originalContentType.includes('jpeg') && !originalContentType.includes('png')) {
        // Normalize to jpeg if unknown
        img = img.jpeg({ quality: 80 });
        contentType = 'image/jpeg';
      }
      buffer = await img.toBuffer();
    } catch {
      // If sharp is unavailable, fall back to original buffer
      contentType = originalContentType;
    }

    // Generate final ETag after processing
    const finalEtag = `W/"${buffer.length}-${new Date(uploadDate).getTime()}"`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
        'ETag': finalEtag,
        'Last-Modified': new Date(uploadDate).toUTCString(),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving image from GridFS:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}



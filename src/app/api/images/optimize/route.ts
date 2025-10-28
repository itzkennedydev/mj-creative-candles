import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { ObjectId } from 'mongodb';
import sharp from 'sharp';

interface ImageDocument {
  _id?: unknown;
  data: string;
  mimeType: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

// Simple in-memory cache with 1 hour TTL
const imageCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCachedImage(key: string): Buffer | null {
  const cached = imageCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.buffer;
  }
  imageCache.delete(key);
  return null;
}

function setCachedImage(key: string, buffer: Buffer) {
  imageCache.set(key, { buffer, timestamp: Date.now() });
  
  // Cleanup old entries if cache gets too large
  if (imageCache.size > 1000) {
    const entries = Array.from(imageCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toDelete = entries.slice(0, 200);
    toDelete.forEach(([key]) => imageCache.delete(key));
  }
}

// GET /api/images/optimize?id=xxx&width=800&quality=80
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const width = parseInt(searchParams.get('width') || '800');
    const quality = parseInt(searchParams.get('quality') || '75');
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Check in-memory cache first
    const cacheKey = `img:${id}:${width}:${quality}`;
    const cached = getCachedImage(cacheKey);
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache': 'HIT',
        },
      });
    }

    // Get image from MongoDB
    const client = await clientPromise;
    const db = client.db('stitch_orders');
    const imagesCollection = db.collection<ImageDocument>('images');

    const image = await imagesCollection.findOne({ _id: new ObjectId(id) });
    
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Extract base64 data from data URI
    const base64Data = image.data.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Optimize image with Sharp - use fast preset for speed
    const optimizedBuffer = await sharp(buffer, {
      pages: 1 // Only process first page
    })
      .resize(width, undefined, { 
        withoutEnlargement: true,
        fit: 'inside',
        fastShrinkOnLoad: true // Speed up resizing
      })
      .jpeg({ 
        quality,
        mozjpeg: true, // Use mozjpeg for better compression/speed
        progressive: false // Faster encoding
      })
      .toBuffer();

    // Cache the optimized image
    setCachedImage(cacheKey, optimizedBuffer);

    // Return optimized image
    return new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Cache': 'MISS',
      },
    });

  } catch (error) {
    console.error('Error optimizing image:', error);
    return NextResponse.json({ error: 'Failed to optimize image' }, { status: 500 });
  }
}


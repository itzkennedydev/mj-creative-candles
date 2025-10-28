import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '~/lib/mongodb';
import { authenticateRequest } from '~/lib/auth';
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

    // Optimize image with Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(width, undefined, { 
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality })
      .toBuffer();

    // Return optimized image
    return new NextResponse(optimizedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });

  } catch (error) {
    console.error('Error optimizing image:', error);
    return NextResponse.json({ error: 'Failed to optimize image' }, { status: 500 });
  }
}


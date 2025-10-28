import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { authenticateRequest } from '~/lib/auth';

// GET /api/admin/gallery - Get all images from public/uploads (ADMIN ONLY)
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await readdir(uploadsDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );
      
      // Get file stats and create image objects
      const images = await Promise.all(
        imageFiles.map(async (filename, index) => {
          const filePath = join(uploadsDir, filename);
          const stats = await stat(filePath);
          
          return {
            id: index.toString(),
            imageId: filename,
            dataUri: `/uploads/${filename}`,
            mimeType: 'image/' + filename.split('.').pop()?.toLowerCase() || 'image/jpeg',
            filename: filename,
            size: stats.size,
            uploadedAt: stats.mtime
          };
        })
      );
      
      // Sort by most recently modified
      images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      
      return NextResponse.json({
        images,
        total: images.length,
        page: 1,
        limit: 50,
        totalPages: 1
      });
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      return NextResponse.json({
        images: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 1
      });
    }
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/gallery?id=filename - Delete image from public/uploads (ADMIN ONLY)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('id');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Security check: only allow deletion of files in uploads directory
    const filenamePath = require('path').basename(filename);
    if (filenamePath !== filename) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const { unlink } = require('fs/promises');
    const filePath = join(process.cwd(), 'public', 'uploads', filename);
    
    await unlink(filePath);

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

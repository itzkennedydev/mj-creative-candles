import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { initializeDefaultAdminEmails } from '~/lib/admin-emails-db';

export async function POST(request: NextRequest) {
  try {
    await initializeDefaultAdminEmails();
    
    return NextResponse.json({
      success: true,
      message: 'Default admin emails initialized successfully'
    });
    
  } catch (error) {
    console.error('Initialize admin emails error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize admin emails' },
      { status: 500 }
    );
  }
}

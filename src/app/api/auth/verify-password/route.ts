import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '~/env.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password: string };
    
    if (!body.password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check if password matches the environment variable
    if (body.password === env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

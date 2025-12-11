import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { env } from '~/env.js';
import { sendAccessRequestEmail } from '~/lib/email-service';

const client = new MongoClient(env.MONGODB_URI);

export interface AccessRequest {
  _id?: string;
  email: string;
  name: string;
  reason: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, reason } = await request.json();
    
    if (!email || !name || !reason) {
      return NextResponse.json(
        { error: 'Email, name, and reason are required' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AccessRequest>('access_requests');
    
    // Check if there's already a pending request for this email
    const existingRequest = await collection.findOne({
      email: normalizedEmail,
      status: 'pending'
    });
    
    if (existingRequest) {
      return NextResponse.json(
        { error: 'A pending access request already exists for this email' },
        { status: 409 }
      );
    }
    
    // Create new access request
    const accessRequest: AccessRequest = {
      email: normalizedEmail,
      name: name.trim(),
      reason: reason.trim(),
      requestedAt: new Date(),
      status: 'pending'
    };
    
    await collection.insertOne(accessRequest);
    
    // Send email notification to current admins
    try {
      await sendAccessRequestEmail(normalizedEmail, name.trim(), reason.trim());
      console.log(`✅ Access request notification sent for ${normalizedEmail}`);
    } catch (emailError) {
      console.error('Failed to send access request email:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully. You will be notified when it is reviewed.'
    });
    
  } catch (error) {
    console.error('Access request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: NextRequest) {
  try {
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<AccessRequest>('access_requests');
    
    const requests = await collection
      .find({})
      .sort({ requestedAt: -1 })
      .toArray();
    
    return NextResponse.json({ requests });
    
  } catch (error) {
    console.error('Get access requests error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

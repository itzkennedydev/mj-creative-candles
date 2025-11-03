import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { env } from '~/env.js';
import { sendNewsletterSubscriptionEmail } from '~/lib/email-service';

const client = new MongoClient(env.MONGODB_URI);

export interface NewsletterSubscription {
  _id?: string;
  email: string;
  subscribedAt: Date;
  isActive: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    await client.connect();
    const db = client.db('stitch_orders');
    const collection = db.collection<NewsletterSubscription>('newsletter_subscriptions');
    
    // Check if email is already subscribed
    const existingSubscription = await collection.findOne({
      email: normalizedEmail,
      isActive: true
    });
    
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'This email is already subscribed to our newsletter' },
        { status: 409 }
      );
    }
    
    // Create new subscription or reactivate existing one
    const subscription: NewsletterSubscription = {
      email: normalizedEmail,
      subscribedAt: new Date(),
      isActive: true
    };
    
    // Check if email exists but is inactive
    const inactiveSubscription = await collection.findOne({
      email: normalizedEmail,
      isActive: false
    });
    
    if (inactiveSubscription) {
      // Reactivate subscription
      await collection.updateOne(
        { email: normalizedEmail },
        { 
          $set: { 
            subscribedAt: new Date(),
            isActive: true
          } 
        }
      );
    } else {
      // Insert new subscription
      await collection.insertOne(subscription);
    }
    
    // Send welcome email
    try {
      await sendNewsletterSubscriptionEmail(normalizedEmail);
      console.log(`✅ Newsletter subscription email sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error('Failed to send newsletter subscription email:', emailError);
      // Don't fail the request if email fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Check your email for confirmation.'
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}


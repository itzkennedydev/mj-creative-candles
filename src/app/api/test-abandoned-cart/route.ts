import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { sendAbandonedCartEmail } from '~/lib/email-service';

/**
 * POST /api/test-abandoned-cart - Send a test abandoned cart email
 * This is a test endpoint to verify the abandoned cart email functionality
 */
export async function POST(request: NextRequest) {
  try {
    const testData = {
      customerEmail: 'itskennedy.dev@gmail.com',
      customerName: 'Kennedy',
      checkoutUrl: 'https://checkout.stripe.com/test-session-url',
      items: [
        {
          productName: 'Moline Beanie',
          quantity: 1,
          productPrice: 25.00,
          selectedSize: 'One Size',
          selectedColor: 'Black',
        },
        {
          productName: 'Custom T-Shirt',
          quantity: 2,
          productPrice: 30.00,
          selectedSize: 'Large',
          selectedColor: 'Navy',
        },
      ],
      total: 85.00,
      emailNumber: 1, // Test with email #1
    };
    
    console.log('🧪 Sending test abandoned cart email to:', testData.customerEmail);
    
    const result = await sendAbandonedCartEmail(testData);
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        email: testData.customerEmail,
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send test email' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}








"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Container } from '~/components/ui/container';

interface ConfirmationResponse {
  success: boolean;
  message?: string;
  orderNumber?: string;
  orderStatus?: string;
  note?: string;
  error?: string;
}

export default function CheckoutSuccessPage() {
  const [orderNumber, setOrderNumber] = useState<string>('');
  const emailsSentRef = useRef(false);

  useEffect(() => {
    // Get session ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdParam = urlParams.get('session_id');
    
    if (sessionIdParam) {
      // Attempt to send confirmation emails as a fallback
      // NOTE: Emails are primarily sent by the Stripe webhook handler after verifying payment.
      // This is just a fallback in case the webhook hasn't processed yet.
      // The endpoint will only send emails if the order status is 'paid' in the database,
      // which ensures the webhook has verified the payment first.
      // Only send once, even if component re-renders
      if (!emailsSentRef.current) {
        emailsSentRef.current = true;
        
        fetch('/api/orders/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: sessionIdParam }),
        })
          .then(async (response) => {
            const data = await response.json() as ConfirmationResponse;
            if (response.ok || response.status === 202) {
              // 202 means payment is pending webhook verification - emails will be sent by webhook
              // 200 means emails were sent successfully (as fallback)
              console.log('Email confirmation status:', data);
              
              // Set order number if available in response
              if (data.orderNumber) {
                setOrderNumber(data.orderNumber);
              }
            } else {
              console.error('Failed to send confirmation emails:', data);
              // Don't show error to user - payment was successful and webhook will handle emails
            }
          })
          .catch((error) => {
            console.error('Error sending confirmation emails:', error);
            // Don't show error to user - payment was successful and webhook will handle emails
          });
      }
    }

    // Clear cart on successful payment by removing items from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('cartCleared'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="py-8 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for your order. We&apos;ll contact you soon to arrange pickup.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Next?</h2>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <p className="text-gray-700">We&apos;ll process your order and prepare your items</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <p className="text-gray-700">We&apos;ll contact you to arrange a convenient pickup time</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <p className="text-gray-700">Come pick up your order at the arranged time</p>
                </div>
              </div>
            </div>

            {orderNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Order Number:</strong> {orderNumber}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Keep this for your records. You&apos;ll receive a confirmation email shortly.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#737373] hover:bg-[#737373]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#737373]"
              >
                Continue Shopping
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#737373]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

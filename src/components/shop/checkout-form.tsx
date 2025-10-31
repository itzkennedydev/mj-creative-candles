"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";
import type { CustomerInfo } from "~/lib/types";
import type { CreateOrderRequest } from "~/lib/order-types";
import { api, handleApiError } from "~/lib/api-client";

export function CheckoutForm() {
  const { items: cartItems, getTotalPrice } = useCart();
  const { addToast } = useToast();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  // Removed shipping address - pickup only

  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerInfo.firstName.trim() || !customerInfo.lastName.trim() || 
        !customerInfo.email.trim() || !customerInfo.phone.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      addToast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        type: 'error'
      });
      return;
    }
    
    // Validate cart has items
    if (cartItems.length === 0) {
      addToast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        type: 'error'
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Calculate totals
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.085; // 8.5% tax
      const shippingCost = 0; // No shipping - pickup only
      const total = subtotal + tax + shippingCost;

      // Prepare order items with XXL surcharge
      const orderItems = cartItems.map(item => {
        const sizeSurcharge = item.selectedSize === 'XXL' ? 3 : 0;
        const finalPrice = item.product.price + sizeSurcharge;
        
        return {
          productId: item.product.id,
          productName: item.product.name,
          productPrice: finalPrice,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        };
      });

      // Prepare order data for database
      const orderData: CreateOrderRequest = {
        customer: customerInfo,
        shipping: {
          street: "Pickup Only",
          city: "Pickup Location",
          state: "Local",
          zipCode: "00000",
          country: "United States"
        },
        items: orderItems,
        subtotal,
        tax,
        shippingCost,
        total,
        paymentMethod,
        notes: notes.trim() || undefined
      };
      
      // Save order to database first using secure API client
      const result: { success: boolean; orderId?: string; orderNumber?: string; error?: string } = await api.createOrder(orderData);

      if (!result.success || !result.orderId) {
        throw new Error('Failed to create order');
      }

      // Create Stripe Checkout session using secure API client
      const checkoutResult: { sessionId?: string; url?: string; error?: string } = await api.createCheckoutSession({
        orderId: result.orderId,
        items: orderItems,
        subtotal,
        tax,
        total,
        customerEmail: customerInfo.email
      });
      
      if (checkoutResult.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutResult.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = handleApiError(error);
      addToast({
        title: 'Order Error',
        description: errorMessage,
        type: 'error'
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white" suppressHydrationWarning>
      
      <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
        {/* Customer Information */}
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Pickup Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Local Pickup Available</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your order will be ready for pickup at our local location. 
                      We&apos;ll contact you when your order is ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Pay Online (Credit/Debit Card)</span>
                    <p className="text-xs text-gray-500 mt-1">Secure online payment required</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                placeholder="Any special instructions or notes for your order..."
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-3 text-base font-medium"
        >
          {isProcessing ? "Processing..." : "Continue to Payment"}
        </Button>
      </form>
    </div>
  );
}
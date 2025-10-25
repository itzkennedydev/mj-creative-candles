"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";
import type { CustomerInfo, ShippingAddress } from "~/lib/types";
import type { CreateOrderRequest } from "~/lib/order-types";

export function CheckoutForm() {
  const { items: cartItems, getTotalPrice, clearCart } = useCart();
  
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
    setIsProcessing(true);
    
    try {
      // Calculate totals
      const subtotal = getTotalPrice();
      const tax = subtotal * 0.085; // 8.5% tax
      const shippingCost = 0; // No shipping - pickup only
      const total = subtotal + tax + shippingCost;

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));

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
      
      // Save order to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (result.success) {
        // Clear cart after successful order
        clearCart();
        
        // Show success message with order number
        alert(`Order placed successfully! Order #${result.orderNumber}`);
        
        // Reset form
        setCustomerInfo({ firstName: "", lastName: "", email: "", phone: "" });
        setNotes("");
        
        // Redirect to home or order confirmation page
        window.location.href = '/';
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
      
    } catch (error) {
      console.error("Checkout error:", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white">
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div>
          <h3 className="text-base md:text-lg font-medium text-gray-900 mb-4">Pickup Information</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Pickup Only Service</h4>
                <p className="text-sm text-blue-700 mt-1">
                  All orders are for pickup only. We'll contact you to arrange a convenient pickup time once your order is ready.
                </p>
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
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-3 text-base font-medium"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </Button>
      </form>
    </div>
  );
}

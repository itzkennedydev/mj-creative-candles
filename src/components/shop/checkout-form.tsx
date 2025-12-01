"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";
import { useToast } from "~/lib/toast-context";
import type { CustomerInfo } from "~/lib/types";
import type { CreateOrderRequest } from "~/lib/order-types";
import { api, handleApiError } from "~/lib/api-client";

interface Settings {
  taxRate: number;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
  pickupInstructions: string;
}

interface CheckoutFormProps {
  appliedDiscount?: { code: string; percent: number; amount: number } | null;
}

export function CheckoutForm({ appliedDiscount }: CheckoutFormProps = {}) {
  const { items: cartItems, getTotalPrice } = useCart();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json() as { settings: Settings };
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Use defaults on error
        setSettings({
          taxRate: 8.5,
          pickupOnly: false,
          freeShippingThreshold: 50,
          shippingCost: 9.99,
          pickupInstructions: "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
        });
      } finally {
        setSettingsLoading(false);
      }
    };

    void loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!settings) {
      addToast({
        title: 'Error',
        description: 'Settings are still loading. Please wait a moment.',
        type: 'error'
      });
      return;
    }
    
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
      // Calculate totals using settings
      const subtotal = getTotalPrice();
      
      // Apply discount if available
      const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent / 100) : 0;
      const subtotalAfterDiscount = subtotal - discountAmount;
      
      // Calculate tax on original subtotal (before discount)
      const tax = subtotal * (settings.taxRate / 100);
      
      // Calculate shipping cost based on settings (on original subtotal before discount)
      let shippingCost = 0;
      if (!settings.pickupOnly && subtotal < settings.freeShippingThreshold) {
        shippingCost = settings.shippingCost;
      }
      
      const total = subtotalAfterDiscount + tax + shippingCost;

      // Prepare order items with XXL and 3XL surcharge
      const orderItems = cartItems.map(item => {
        const sizeSurcharge = item.selectedSize === 'XXL' ? 3 : item.selectedSize === '3XL' ? 5 : 0;
        const finalPrice = item.product.price + sizeSurcharge;
        
        return {
          productId: item.product.id,
          productName: item.product.name,
          productPrice: finalPrice,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
          customColorValue: item.customColorValue
        };
      });

      // Build notes with custom color information and embroidery name from cart items
      const customColorNotes: string[] = [];
      const embroideryNotes: string[] = [];
      const itemOrderNotes: string[] = [];
      
      cartItems.forEach(item => {
        if (item.customColorValue && item.selectedColor === "Custom") {
          customColorNotes.push(`${item.product.name}: Custom color - ${item.customColorValue}`);
        }
        // Get embroidery name from cart item (for beanie)
        if (item.embroideryName?.trim()) {
          embroideryNotes.push(`${item.product.name} - Embroidery Name: ${item.embroideryName.trim()}`);
        }
        // Get order notes from cart item (for beanie)
        if (item.orderNotes?.trim()) {
          itemOrderNotes.push(`${item.product.name} - Notes: ${item.orderNotes.trim()}`);
        }
      });
      
      const allNotes = [
        ...(customColorNotes.length > 0 ? customColorNotes : []),
        ...(embroideryNotes.length > 0 ? embroideryNotes : []),
        ...(itemOrderNotes.length > 0 ? itemOrderNotes : [])
      ].join('\n\n');

      // Prepare order data for database
      const orderData: CreateOrderRequest = {
        customer: customerInfo,
        shipping: settings.pickupOnly ? {
          street: "Pickup Only",
          city: "Pickup Location",
          state: "Local",
          zipCode: "00000",
          country: "United States"
        } : {
          street: "Pickup Only", // Still pickup for now, but structure allows shipping
          city: "Pickup Location",
          state: "Local",
          zipCode: "00000",
          country: "United States"
        },
        items: orderItems,
        subtotal: subtotalAfterDiscount,
        tax,
        shippingCost,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
        paymentMethod,
        notes: allNotes || undefined
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
        subtotal: subtotalAfterDiscount,
        tax,
        shippingCost,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
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

  if (settingsLoading) {
    return (
      <div className="bg-white" suppressHydrationWarning>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

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
                      {settings?.pickupInstructions || "Your order will be ready for pickup at our local location. We'll contact you when your order is ready."}
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
            
            {cartItems.some(item => item.product.requiresBabyClothes) && (
              <div className="p-3 sm:p-4 bg-[#E6F7FA] border border-[#74CADC] rounded-md">
                <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] font-bold text-[#0A5565] mb-1">
                  👶 Don&apos;t forget to bring your baby clothes!
                </p>
                <p className="text-[13px] sm:text-[14px] leading-[140%] sm:leading-[130%] text-[#0A5565]">
                  Please bring your baby clothes within {cartItems.find(item => item.product.requiresBabyClothes)?.product.babyClothesDeadlineDays || 5} days of placing your order.
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isProcessing || !settings}
          className="w-full bg-[#0A5565] hover:bg-[#083d4a] text-white py-4 text-base font-semibold rounded-xl"
        >
          {isProcessing ? "Processing..." : "Continue to Payment"}
        </Button>
      </form>
    </div>
  );
}

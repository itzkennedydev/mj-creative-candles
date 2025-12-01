"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCart } from "~/lib/cart-context";

interface Settings {
  taxRate: number;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
}

// Valid discount codes (you can expand this or move to a database)
const VALID_DISCOUNT_CODES: Record<string, { discountPercent: number; description: string }> = {
  'STITCHIT': { discountPercent: 15, description: '15% off - Cyber Monday Sale' },
};

interface OrderSummaryProps {
  appliedDiscount?: { code: string; percent: number; amount: number } | null;
  setAppliedDiscount?: (discount: { code: string; percent: number; amount: number } | null) => void;
}

export function OrderSummary({ appliedDiscount: propAppliedDiscount, setAppliedDiscount: propSetAppliedDiscount }: OrderSummaryProps = {}) {
  const { items: cartItems, getTotalPrice, updateQuantity } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [internalDiscount, setInternalDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState("");
  
  // Use prop discount if provided, otherwise use internal state
  const appliedDiscount = propAppliedDiscount !== undefined ? propAppliedDiscount : internalDiscount;
  const setAppliedDiscount = propSetAppliedDiscount || setInternalDiscount;
  
  const subtotal = getTotalPrice();
  const taxRate = settings?.taxRate ?? 8.5;
  
  // Calculate discount - recalculate amount based on current subtotal
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent / 100) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate tax on original subtotal (before discount)
  const tax = subtotal * (taxRate / 100);
  
  // Calculate shipping based on settings (on original subtotal before discount)
  let shipping = 0;
  if (settings && !settings.pickupOnly && subtotal < settings.freeShippingThreshold) {
    shipping = settings.shippingCost;
  }
  
  const total = subtotalAfterDiscount + tax + shipping;

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
        });
      }
    };

    void loadSettings();
  }, []);

  const handleApplyDiscount = () => {
    setDiscountError("");
    const code = discountCode.trim().toUpperCase();
    
    if (!code) {
      setDiscountError("Please enter a discount code");
      return;
    }
    
    const discount = VALID_DISCOUNT_CODES[code];
    if (!discount) {
      setDiscountError("Invalid discount code");
      setAppliedDiscount(null);
      return;
    }
    
    const discountAmount = subtotal * discount.discountPercent / 100;
    setAppliedDiscount({
      code,
      percent: discount.discountPercent,
      amount: discountAmount
    });
    setDiscountError("");
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  return (
    <div className="bg-gray-50 rounded-xl md:rounded-2xl p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-6 md:mb-8">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Your cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}-${item.customColorValue ?? 'default'}`;
            return (
              <div key={itemId} className="flex gap-4">
                <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {item.selectedSize && `Size: ${item.selectedSize}`}
                    {item.selectedSize && item.selectedColor && " • "}
                    {item.selectedColor && item.selectedColor === "Custom" && item.customColorValue
                      ? `Color: Custom (${item.customColorValue})`
                      : item.selectedColor && `Color: ${item.selectedColor}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-600">Qty:</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${((item.product.price + (item.selectedSize === 'XXL' ? 3 : item.selectedSize === '3XL' ? 5 : 0)) * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between items-center py-2 px-3 bg-green-50 border border-green-200 rounded-lg -mx-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <div>
                <span className="text-sm font-semibold text-green-700">You&apos;re saving {appliedDiscount.percent}%!</span>
                <p className="text-xs text-green-600">{appliedDiscount.code} applied</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-700">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        {settings?.pickupOnly ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pickup</span>
            <span className="text-gray-900">Free</span>
          </div>
        ) : shipping > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">${shipping.toFixed(2)}</span>
          </div>
        ) : subtotal >= (settings?.freeShippingThreshold ?? 50) ? (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">Free</span>
          </div>
        ) : null}
        <div className="border-t pt-2">
        <div className="flex justify-between text-lg font-medium">
          <span className="text-gray-900">Total</span>
          <span className="text-gray-900">${total.toFixed(2)}</span>
        </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="mt-4 md:mt-6">
        {appliedDiscount ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Discount Applied</p>
                <p className="text-xs text-green-600 mt-1">{appliedDiscount.code} - {appliedDiscount.percent}% off</p>
              </div>
              <button
                onClick={handleRemoveDiscount}
                className="text-sm text-green-700 hover:text-green-900 underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Promo code"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setDiscountError("");
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyDiscount();
                  }
                }}
                className={`flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                  discountError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                onClick={handleApplyDiscount}
                className="px-4 py-3 bg-[#0A5565] text-white rounded-xl hover:bg-[#083d4a] transition-colors font-medium"
              >
                Apply
              </button>
            </div>
            {discountError && (
              <p className="text-sm text-red-600">{discountError}</p>
            )}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Secure checkout with SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

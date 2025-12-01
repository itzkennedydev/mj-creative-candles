"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Minus, Tag, Trash2 } from "lucide-react";
import { useCart } from "~/lib/cart-context";

interface Settings {
  taxRate: number;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
}

// Valid discount codes
const VALID_DISCOUNT_CODES: Record<string, { discountPercent: number; description: string }> = {
  'STITCHIT': { discountPercent: 15, description: '15% off' },
};

interface OrderSummaryProps {
  appliedDiscount?: { code: string; percent: number; amount: number } | null;
  setAppliedDiscount?: (discount: { code: string; percent: number; amount: number } | null) => void;
}

export function OrderSummary({ appliedDiscount: propAppliedDiscount, setAppliedDiscount: propSetAppliedDiscount }: OrderSummaryProps = {}) {
  const { items: cartItems, getTotalPrice, updateQuantity, removeItem } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [internalDiscount, setInternalDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  
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

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 sticky top-4">
      {/* Header with item count */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
        <span className="text-sm text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>
      
      {/* Cart Items - Compact */}
      <div className="space-y-3 mb-5 max-h-[280px] overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}-${item.customColorValue ?? 'default'}`;
            const itemPrice = (item.product.price + (item.selectedSize === 'XXL' ? 3 : item.selectedSize === '3XL' ? 5 : 0)) * item.quantity;
            return (
              <div key={itemId} className="flex gap-3 group">
                <div className="w-14 h-14 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.product.name}</h3>
                  <p className="text-xs text-gray-500 truncate">
                    {[item.selectedSize, item.selectedColor].filter(Boolean).join(' • ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center bg-gray-100 rounded-md">
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-l-md transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-medium text-gray-900 px-2">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-r-md transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(itemId)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-gray-900 text-sm">${itemPrice.toFixed(2)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Promo Code - Collapsible style */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        {appliedDiscount ? (
          <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{appliedDiscount.code}</span>
              <span className="text-xs text-green-600">({appliedDiscount.percent}% off)</span>
            </div>
            <button
              onClick={handleRemoveDiscount}
              className="text-xs text-green-700 hover:text-green-900"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Discount code"
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
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A5565] focus:border-transparent ${
                    discountError ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
              </div>
              <button
                onClick={handleApplyDiscount}
                disabled={isApplyingCode}
                className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Apply
              </button>
            </div>
            {discountError && (
              <p className="text-xs text-red-600">{discountError}</p>
            )}
          </div>
        )}
      </div>

      {/* Order Totals - Clear hierarchy */}
      <div className="border-t border-gray-100 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        
        {appliedDiscount && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Discount ({appliedDiscount.percent}%)</span>
            <span className="text-green-600 font-medium">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">${tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pickup</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        
        <div className="border-t border-gray-100 pt-3 mt-2">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <div className="text-right">
              {appliedDiscount && (
                <span className="text-sm text-gray-400 line-through block">${(subtotal + tax).toFixed(2)}</span>
              )}
              <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Savings callout if discount applied */}
      {appliedDiscount && (
        <div className="mt-4 bg-green-50 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-green-700">
            🎉 You&apos;re saving ${discountAmount.toFixed(2)} on this order!
          </p>
        </div>
      )}
    </div>
  );
}

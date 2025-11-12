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

export function OrderSummary() {
  const { items: cartItems, getTotalPrice, updateQuantity } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  
  const subtotal = getTotalPrice();
  const taxRate = settings?.taxRate ?? 8.5;
  const tax = subtotal * (taxRate / 100);
  
  // Calculate shipping based on settings
  let shipping = 0;
  if (settings && !settings.pickupOnly && subtotal < settings.freeShippingThreshold) {
    shipping = settings.shippingCost;
  }
  
  const total = subtotal + tax + shipping;

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
        <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
          <button className="px-4 py-3 bg-[#74CADC] text-[#0A5565] rounded-md hover:bg-[#74CADC]/90 transition-colors font-medium">
            Apply
          </button>
        </div>
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

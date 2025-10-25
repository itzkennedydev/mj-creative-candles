"use client";

import Image from "next/image";
import { useCart } from "~/lib/cart-context";

export function OrderSummary() {
  const { items: cartItems, getTotalPrice } = useCart();
  
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.085; // 8.5% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-gray-50 rounded-lg p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-6 md:mb-8">Order Summary</h2>
      
      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Your cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} className="flex gap-4">
              <div className="w-16 h-16 relative rounded-md overflow-hidden">
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
                  {item.selectedColor && `Color: ${item.selectedColor}`}
                </p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))
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
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
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

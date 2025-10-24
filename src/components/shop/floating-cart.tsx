"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const { items: cartItems, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  const itemCount = getTotalItems();
  const subtotal = getTotalPrice();

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-gray-900 text-white px-4 py-3 md:px-6 md:py-4 rounded-lg shadow-lg hover:bg-gray-800 transition-colors z-40 flex items-center gap-2 md:gap-3"
      >
        <div className="relative">
          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <div className="text-xs md:text-sm font-medium hidden sm:block">
          Cart ({itemCount})
        </div>
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Panel */}
          <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Cart ({itemCount})</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const itemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}`;
                      return (
                        <div key={itemId} className="flex gap-4 border-b border-gray-100 pb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{item.product.name}</h3>
                            <p className="text-gray-500 text-xs">
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                              {item.selectedSize && item.selectedColor && " • "}
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                  className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                  className="p-1 border border-gray-300 rounded hover:bg-gray-50"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-medium text-gray-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base md:text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-base md:text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <Link href="/shop/checkout">
                    <Button 
                      className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-2 md:py-3"
                      onClick={() => setIsOpen(false)}
                    >
                      Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

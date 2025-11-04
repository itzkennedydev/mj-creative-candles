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
      {/* Floating Cart Button - Hidden on desktop (lg and above) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 lg:hidden bg-gray-600 text-white px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-lg shadow-lg hover:bg-gray-700 active:bg-gray-800 transition-colors z-40 flex items-center gap-2 sm:gap-2.5 md:gap-3 touch-manipulation"
      >
        <div className="relative">
          <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5 flex items-center justify-center font-medium">
              {itemCount}
            </span>
          )}
        </div>
        <div className="text-xs sm:text-[13px] md:text-sm font-medium hidden xs:block">
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
              <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Cart ({itemCount})</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors touch-manipulation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 sm:py-12">
                    <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                    <p className="text-[13px] sm:text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item) => {
                      const itemId = `${item.product.id}-${item.selectedSize ?? 'default'}-${item.selectedColor ?? 'default'}-${item.customColorValue ?? 'default'}`;
                      return (
                        <div key={itemId} className="flex gap-3 sm:gap-4 border-b border-gray-100 pb-3 sm:pb-4">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-[13px] sm:text-sm truncate">{item.product.name}</h3>
                            <p className="text-gray-500 text-[11px] sm:text-xs mt-0.5">
                              {item.selectedSize && `Size: ${item.selectedSize}`}
                              {item.selectedSize && item.selectedColor && " • "}
                              {item.selectedColor && item.selectedColor === "Custom" && item.customColorValue
                                ? `Color: Custom (${item.customColorValue})`
                                : item.selectedColor && `Color: ${item.selectedColor}`}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <button 
                                  onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                  className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs sm:text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                  className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="font-medium text-gray-900 text-xs sm:text-sm">
                                ${((item.product.price + (item.selectedSize === 'XXL' ? 3 : item.selectedSize === '3XL' ? 5 : 0)) * item.quantity).toFixed(2)}
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
                <div className="border-t border-gray-200 p-4 sm:p-5 md:p-6">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <Link href="/shop/checkout">
                    <Button 
                      className="w-full bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white py-2.5 sm:py-2 md:py-3 text-sm sm:text-base font-medium touch-manipulation transition-all active:scale-[0.98]"
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

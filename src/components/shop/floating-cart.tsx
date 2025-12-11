"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Plus, Minus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";

export function FloatingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    items: cartItems,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
  } = useCart();

  const itemCount = getTotalItems();
  const subtotal = getTotalPrice();

  return (
    <>
      {/* Floating Cart Button - Hidden on desktop (lg and above) */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex touch-manipulation items-center gap-2 rounded-xl bg-[#0A5565] px-3 py-2.5 text-white transition-colors hover:bg-[#083d4a] active:bg-[#062d38] sm:bottom-5 sm:right-5 sm:gap-2.5 sm:px-4 sm:py-3 md:bottom-6 md:right-6 md:gap-3 md:px-6 md:py-4 lg:hidden"
      >
        <div className="relative">
          <ShoppingCart className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white sm:h-[18px] sm:w-[18px] sm:text-xs md:h-5 md:w-5">
              {itemCount}
            </span>
          )}
        </div>
        <div className="xs:block hidden text-xs font-medium sm:text-[13px] md:text-sm">
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
          <div className="absolute right-0 top-0 h-full w-full border-l border-gray-200 bg-white sm:w-96">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-5 md:p-6">
                <h2 className="text-base font-semibold text-gray-900 sm:text-lg md:text-xl">
                  Cart ({itemCount})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="touch-manipulation rounded-md p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6">
                {cartItems.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 sm:py-12">
                    <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:mb-4 sm:h-12 sm:w-12" />
                    <p className="text-[13px] sm:text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item) => {
                      const itemId = item.product.id;
                      return (
                        <div
                          key={itemId}
                          className="flex gap-3 border-b border-gray-100 pb-3 sm:gap-4 sm:pb-4"
                        >
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-gray-100 sm:h-16 sm:w-16">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-[13px] font-medium text-gray-900 sm:text-sm">
                              {item.product.name}
                            </h3>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                  onClick={() =>
                                    updateQuantity(itemId, item.quantity - 1)
                                  }
                                  className="touch-manipulation rounded border border-gray-300 p-1 transition-colors hover:bg-gray-50 active:bg-gray-100 sm:p-1.5"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="min-w-[1.5rem] text-center text-xs sm:text-sm">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(itemId, item.quantity + 1)
                                  }
                                  className="touch-manipulation rounded border border-gray-300 p-1 transition-colors hover:bg-gray-50 active:bg-gray-100 sm:p-1.5"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                $
                                {(item.product.price * item.quantity).toFixed(
                                  2,
                                )}
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
                  <div className="mb-3 flex items-center justify-between sm:mb-4">
                    <span className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                      Total
                    </span>
                    <span className="text-sm font-semibold text-gray-900 sm:text-base md:text-lg">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <Link href="/shop/checkout">
                    <Button
                      className="w-full touch-manipulation bg-gray-600 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-700 active:scale-[0.98] active:bg-gray-800 sm:py-2 sm:text-base md:py-3"
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

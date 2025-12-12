"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Minus, Tag, Trash2 } from "lucide-react";
import { useCart } from "~/lib/cart-context";
import type { Product } from "~/lib/types";
import { getProductPrice } from "~/lib/types";

interface Settings {
  taxRate: number;
  pickupOnly: boolean;
  freeShippingThreshold: number;
  shippingCost: number;
}

// Valid discount codes with optional expiration
interface DiscountCode {
  discountPercent: number;
  description: string;
  expiresAt?: Date; // Optional expiration date
}

const VALID_DISCOUNT_CODES: Record<string, DiscountCode> = {
  STITCHIT: {
    discountPercent: 15,
    description: "15% off",
    expiresAt: new Date("2025-12-02T05:59:59Z"), // Dec 1st 11:59 PM CST = Dec 2nd 05:59:59 UTC
  },
};

// Check if a discount code is still valid (not expired)
function isDiscountCodeValid(code: string): boolean {
  const discount = VALID_DISCOUNT_CODES[code];
  if (!discount) return false;
  if (!discount.expiresAt) return true; // No expiration = always valid
  return new Date() < discount.expiresAt;
}

interface OrderSummaryProps {
  appliedDiscount?: { code: string; percent: number; amount: number } | null;
  setAppliedDiscount?: (
    discount: { code: string; percent: number; amount: number } | null,
  ) => void;
}

// Helper function to get the correct image for a selected color
function getImageForColor(
  product: Product,
  selectedColor: string | undefined,
): string {
  if (!selectedColor || !product.colors || product.colors.length <= 1) {
    return product.image || "/placeholder-image.png";
  }

  const colorLower = selectedColor.toLowerCase();
  const allImages = [
    product.image,
    ...(product.images ?? []).map((img) =>
      typeof img === "string" ? img : img.dataUri,
    ),
  ];

  for (const imageSrc of allImages) {
    if (!imageSrc) continue; // Skip undefined images
    const imageSrcLower = imageSrc.toLowerCase();

    // Beanie-specific color mappings - match specific color keywords
    if (colorLower.includes("forest green") && imageSrcLower.includes("forest"))
      return imageSrc;
    if (
      colorLower.includes("gold") &&
      colorLower.includes("white") &&
      imageSrcLower.includes("gold")
    )
      return imageSrc;
    if (colorLower.includes("icon grey") && imageSrcLower.includes("icon"))
      return imageSrc;
    if (colorLower.includes("maroon") && imageSrcLower.includes("maroon"))
      return imageSrc;
    if (colorLower.includes("pink raspberry") && imageSrcLower.includes("pink"))
      return imageSrc;
    if (colorLower.includes("purple") && imageSrcLower.includes("purple"))
      return imageSrc;
    if (
      colorLower.includes("red") &&
      colorLower.includes("black") &&
      !colorLower.includes("royal") &&
      imageSrcLower.includes("red:black")
    )
      return imageSrc;
    if (
      colorLower.includes("red") &&
      colorLower.includes("royal") &&
      imageSrcLower.includes("red:royal")
    )
      return imageSrc;
    if (colorLower.includes("true royal") && imageSrcLower.includes("true"))
      return imageSrc;
    if (
      colorLower.includes("black on black") &&
      imageSrcLower.includes("blackonblack")
    )
      return imageSrc;
    if (
      colorLower.includes("moline black") &&
      imageSrcLower.includes("molineblack")
    )
      return imageSrc;
    if (colorLower.includes("royal blue") && imageSrcLower.includes("blue"))
      return imageSrc;
    if (
      colorLower === "moline" &&
      imageSrcLower.includes("beanie") &&
      !imageSrcLower.includes("black")
    )
      return imageSrc;
    // Generic fallbacks
    if (
      colorLower === "black" &&
      imageSrcLower.includes("black") &&
      !imageSrcLower.includes("maroon") &&
      !imageSrcLower.includes("purple") &&
      !imageSrcLower.includes("red")
    )
      return imageSrc;
    if (colorLower === "blue" && imageSrcLower.includes("blue"))
      return imageSrc;
    if (colorLower === "white" && imageSrcLower.includes("white"))
      return imageSrc;
    if (colorLower === "red" && imageSrcLower.includes("red")) return imageSrc;
  }

  return product.image || "/placeholder-image.png"; // Fallback to primary image
}

export function OrderSummary({
  appliedDiscount: propAppliedDiscount,
  setAppliedDiscount: propSetAppliedDiscount,
}: OrderSummaryProps = {}) {
  const {
    items: cartItems,
    getTotalPrice,
    updateQuantity,
    removeItem,
  } = useCart();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [internalDiscount, setInternalDiscount] = useState<{
    code: string;
    percent: number;
    amount: number;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  // Use prop discount if provided, otherwise use internal state
  const appliedDiscount =
    propAppliedDiscount !== undefined ? propAppliedDiscount : internalDiscount;
  const setAppliedDiscount = propSetAppliedDiscount || setInternalDiscount;

  const subtotal = getTotalPrice();
  const taxRate = settings?.taxRate ?? 8.5;

  // Calculate discount - recalculate amount based on current subtotal
  const discountAmount = appliedDiscount
    ? (subtotal * appliedDiscount.percent) / 100
    : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Calculate tax on original subtotal (before discount)
  const tax = subtotal * (taxRate / 100);

  // Calculate shipping based on settings (on original subtotal before discount)
  let shipping = 0;
  if (
    settings &&
    !settings.pickupOnly &&
    subtotal < settings.freeShippingThreshold
  ) {
    shipping = settings.shippingCost;
  }

  const total = subtotalAfterDiscount + tax + shipping;

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = (await response.json()) as { settings: Settings };
          setSettings(data.settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
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

    // Check if the code has expired
    if (!isDiscountCodeValid(code)) {
      setDiscountError("This discount code has expired");
      setAppliedDiscount(null);
      return;
    }

    const discountAmount = (subtotal * discount.discountPercent) / 100;
    setAppliedDiscount({
      code,
      percent: discount.discountPercent,
      amount: discountAmount,
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
    <div className="sticky top-4 rounded-xl border border-gray-200 bg-white p-5 md:p-6">
      {/* Header with item count */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Your Order</h2>
        <span className="text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Cart Items - Compact */}
      <div className="mb-5 max-h-[280px] space-y-3 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="py-6 text-center text-gray-500">
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const itemId = `${item.product.id}-${item.selectedColor ?? "default"}-${item.customColorValue ?? "default"}`;
            const itemPrice = getProductPrice(item.product) * item.quantity;
            return (
              <div key={itemId} className="group flex gap-3">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={getImageForColor(item.product, item.selectedColor)}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-medium text-gray-900">
                    {item.product.name}
                  </h3>
                  <p className="truncate text-xs text-gray-500">
                    {item.selectedColor}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center rounded-md bg-gray-100">
                      <button
                        onClick={() =>
                          updateQuantity(itemId, item.quantity - 1)
                        }
                        className="rounded-l-md p-1 transition-colors hover:bg-gray-200"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(itemId, item.quantity + 1)
                        }
                        className="rounded-r-md p-1 transition-colors hover:bg-gray-200"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(itemId)}
                      className="p-1 text-gray-400 opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${itemPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Promo Code - Collapsible style */}
      {cartItems.length > 0 && (
        <div className="mb-4 border-t border-gray-100 pt-4">
          {appliedDiscount ? (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {appliedDiscount.code}
                </span>
                <span className="text-xs text-green-600">
                  ({appliedDiscount.percent}% off)
                </span>
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
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountError("");
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyDiscount();
                      }
                    }}
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] ${
                      discountError ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                </div>
                <button
                  onClick={handleApplyDiscount}
                  disabled={isApplyingCode}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
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
      )}

      {/* Order Totals - Only show when cart has items */}
      {cartItems.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>

          {appliedDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">
                Discount ({appliedDiscount.percent}%)
              </span>
              <span className="font-medium text-green-600">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pickup</span>
            <span className="font-medium text-green-600">Free</span>
          </div>

          <div className="mt-2 border-t border-gray-100 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">
                Total
              </span>
              <div className="text-right">
                {appliedDiscount && (
                  <span className="block text-sm text-gray-400 line-through">
                    ${(subtotal + tax).toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Savings callout if discount applied */}
          {appliedDiscount && (
            <div className="mt-4 rounded-lg bg-green-50 p-3 text-center">
              <p className="text-sm font-medium text-green-700">
                🎉 You&apos;re saving ${discountAmount.toFixed(2)} on this
                order!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

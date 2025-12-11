"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";
import { getProductPrice } from "~/lib/types";
import { useToast } from "~/lib/toast-context";
import type { CustomerInfo } from "~/lib/types";
import type { CreateOrderRequest } from "~/lib/order-types";
import { api, handleApiError } from "~/lib/api-client";
import { Lock, Shield, CheckCircle } from "lucide-react";

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
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Inline validation states
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
  });

  const [paymentMethod, setPaymentMethod] = useState<"card">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto-focus first input
  useEffect(() => {
    if (!settingsLoading && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [settingsLoading]);

  // Validation helpers
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => phone.replace(/\D/g, "").length >= 10;

  const getFieldError = (field: keyof typeof touched) => {
    if (!touched[field]) return null;
    switch (field) {
      case "firstName":
        return !customerInfo.firstName.trim() ? "First name is required" : null;
      case "lastName":
        return !customerInfo.lastName.trim() ? "Last name is required" : null;
      case "email":
        return !customerInfo.email.trim()
          ? "Email is required"
          : !isValidEmail(customerInfo.email)
            ? "Enter a valid email"
            : null;
      case "phone":
        return !customerInfo.phone.trim()
          ? "Phone is required"
          : !isValidPhone(customerInfo.phone)
            ? "Enter a valid phone number"
            : null;
    }
  };

  const isFormValid =
    customerInfo.firstName.trim() &&
    customerInfo.lastName.trim() &&
    isValidEmail(customerInfo.email) &&
    isValidPhone(customerInfo.phone);

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
          pickupInstructions:
            "Please call (309) 373-6017 to schedule pickup. Available Monday-Friday 9AM-5PM.",
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
        title: "Error",
        description: "Settings are still loading. Please wait a moment.",
        type: "error",
      });
      return;
    }

    // Validate required fields
    if (
      !customerInfo.firstName.trim() ||
      !customerInfo.lastName.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim()
    ) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        type: "error",
      });
      return;
    }

    // Validate cart has items
    if (cartItems.length === 0) {
      addToast({
        title: "Empty Cart",
        description: "Your cart is empty",
        type: "error",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate totals using settings
      const subtotal = getTotalPrice();

      // Apply discount if available
      const discountAmount = appliedDiscount
        ? (subtotal * appliedDiscount.percent) / 100
        : 0;
      const subtotalAfterDiscount = subtotal - discountAmount;

      // Calculate tax on original subtotal (before discount)
      const tax = subtotal * (settings.taxRate / 100);

      // Calculate shipping cost based on settings (on original subtotal before discount)
      let shippingCost = 0;
      if (!settings.pickupOnly && subtotal < settings.freeShippingThreshold) {
        shippingCost = settings.shippingCost;
      }

      const total = subtotalAfterDiscount + tax + shippingCost;

      // Prepare order items
      const orderItems = cartItems.map((item) => {
        const finalPrice = getProductPrice(item.product);

        return {
          productId: item.product.id,
          productName: item.product.name,
          productPrice: finalPrice,
          quantity: item.quantity,
          selectedColor: item.selectedColor,
          customColorValue: item.customColorValue,
        };
      });

      // Build notes with custom color information and embroidery name from cart items
      const customColorNotes: string[] = [];
      const embroideryNotes: string[] = [];
      const itemOrderNotes: string[] = [];

      cartItems.forEach((item) => {
        if (item.customColorValue && item.selectedColor === "Custom") {
          customColorNotes.push(
            `${item.product.name}: Custom color - ${item.customColorValue}`,
          );
        }
        // Get embroidery name from cart item (for beanie)
        if (item.embroideryName?.trim()) {
          embroideryNotes.push(
            `${item.product.name} - Embroidery Name: ${item.embroideryName.trim()}`,
          );
        }
        // Get order notes from cart item (for beanie)
        if (item.orderNotes?.trim()) {
          itemOrderNotes.push(
            `${item.product.name} - Notes: ${item.orderNotes.trim()}`,
          );
        }
      });

      const allNotes = [
        ...(customColorNotes.length > 0 ? customColorNotes : []),
        ...(embroideryNotes.length > 0 ? embroideryNotes : []),
        ...(itemOrderNotes.length > 0 ? itemOrderNotes : []),
      ].join("\n\n");

      // Prepare order data for database
      const orderData: CreateOrderRequest = {
        customer: customerInfo,
        shipping: settings.pickupOnly
          ? {
              street: "Pickup Only",
              city: "Pickup Location",
              state: "Local",
              zipCode: "00000",
              country: "United States",
            }
          : {
              street: "Pickup Only", // Still pickup for now, but structure allows shipping
              city: "Pickup Location",
              state: "Local",
              zipCode: "00000",
              country: "United States",
            },
        items: orderItems,
        subtotal: subtotalAfterDiscount,
        tax,
        shippingCost,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
        paymentMethod,
        notes: allNotes || undefined,
      };

      // Save order to database first using secure API client
      const result: {
        success: boolean;
        orderId?: string;
        orderNumber?: string;
        error?: string;
      } = await api.createOrder(orderData);

      if (!result.success || !result.orderId) {
        throw new Error("Failed to create order");
      }

      // Create Stripe Checkout session using secure API client
      const checkoutResult: {
        sessionId?: string;
        url?: string;
        error?: string;
      } = await api.createCheckoutSession({
        orderId: result.orderId,
        items: orderItems,
        subtotal: subtotalAfterDiscount,
        tax,
        shippingCost,
        discountCode: appliedDiscount?.code,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        total,
        customerEmail: customerInfo.email,
      });

      if (checkoutResult.url) {
        // Redirect to Stripe Checkout
        window.location.href = checkoutResult.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = handleApiError(error);
      addToast({
        title: "Order Error",
        description: errorMessage,
        type: "error",
      });
      setIsProcessing(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="bg-white" suppressHydrationWarning>
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-600"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Format phone as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="bg-white" suppressHydrationWarning>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f] font-medium text-white">
              1
            </div>
            <span className="font-medium text-gray-900">Your Info</span>
          </div>
          <div className="mx-4 h-[2px] flex-1 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-500">
              2
            </div>
            <span className="text-gray-500">Payment</span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        suppressHydrationWarning
      >
        {/* Customer Information - Streamlined */}
        <div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            Contact Information
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            We&apos;ll use this to send your order confirmation
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                required
                autoComplete="given-name"
                value={customerInfo.firstName}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    firstName: e.target.value,
                  })
                }
                onBlur={() => setTouched({ ...touched, firstName: true })}
                className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] ${
                  getFieldError("firstName")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="John"
                suppressHydrationWarning
              />
              {getFieldError("firstName") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("firstName")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                required
                autoComplete="family-name"
                value={customerInfo.lastName}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, lastName: e.target.value })
                }
                onBlur={() => setTouched({ ...touched, lastName: true })}
                className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] ${
                  getFieldError("lastName")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Doe"
                suppressHydrationWarning
              />
              {getFieldError("lastName") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("lastName")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={customerInfo.email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, email: e.target.value })
                }
                onBlur={() => setTouched({ ...touched, email: true })}
                className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] ${
                  getFieldError("email")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="john@example.com"
                suppressHydrationWarning
              />
              {getFieldError("email") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("email")}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    phone: formatPhone(e.target.value),
                  })
                }
                onBlur={() => setTouched({ ...touched, phone: true })}
                className={`w-full rounded-lg border px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1d1d1f] ${
                  getFieldError("phone")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="(555) 123-4567"
                suppressHydrationWarning
              />
              {getFieldError("phone") && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError("phone")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup - Simplified with clear value proposition */}
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Free Local Pickup</h4>
              <p className="mt-1 text-sm text-green-700">
                {settings?.pickupInstructions ||
                  "We'll contact you when your order is ready for pickup."}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isProcessing || !settings || !isFormValid}
            className={`w-full rounded-xl py-4 text-base font-semibold transition-all ${
              isFormValid
                ? "bg-[#1d1d1f] text-white hover:bg-[#0a0a0a]"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4" />
                Pay Now • $
                {(
                  getTotalPrice() * (1 + (settings?.taxRate || 8.5) / 100) -
                  (appliedDiscount
                    ? (getTotalPrice() * appliedDiscount.percent) / 100
                    : 0)
                ).toFixed(2)}
              </span>
            )}
          </Button>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <Lock className="h-4 w-4" />
              SSL Encrypted
            </span>
          </div>

          {/* Reassurance */}
          <p className="text-center text-xs text-gray-500">
            By completing your purchase, you agree to our terms of service.
          </p>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "~/components/ui/container";
import { CheckoutForm } from "~/components/shop/checkout-form";
import { OrderSummary } from "~/components/shop/order-summary";
import { ChevronLeft, Lock } from "lucide-react";

export default function CheckoutPage() {
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout Header - Focused, minimal distractions */}
      <div className="bg-white border-b border-gray-100">
        <Container>
          <div className="py-4 flex items-center justify-between">
            <Link 
              href="/shop" 
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Lock className="w-4 h-4 text-green-600" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-6 sm:py-8 md:py-10">
          {/* Compact header */}
          <div className="mb-6 text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Complete Your Order</h1>
          </div>

          {/* Layout: On mobile, order summary collapsible at top. On desktop, form left, summary right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            {/* Form - Takes more space */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <CheckoutForm appliedDiscount={appliedDiscount} />
            </div>
            
            {/* Order Summary - Sticky sidebar */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <OrderSummary appliedDiscount={appliedDiscount} setAppliedDiscount={setAppliedDiscount} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

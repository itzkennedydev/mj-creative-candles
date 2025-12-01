"use client";

import { useState } from "react";
import { Container } from "~/components/ui/container";
import { CheckoutForm } from "~/components/shop/checkout-form";
import { OrderSummary } from "~/components/shop/order-summary";

export default function CheckoutPage() {
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="py-6 sm:py-8 md:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Checkout</h1>
            <p className="text-[14px] sm:text-base md:text-lg text-gray-500">Complete your order</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <CheckoutForm appliedDiscount={appliedDiscount} />
            <OrderSummary appliedDiscount={appliedDiscount} setAppliedDiscount={setAppliedDiscount} />
          </div>
        </div>
      </Container>
    </div>
  );
}

import { Container } from "~/components/ui/container";
import { CheckoutForm } from "~/components/shop/checkout-form";
import { OrderSummary } from "~/components/shop/order-summary";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Container>
        <div className="py-8 md:py-16">
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Checkout</h1>
            <p className="text-gray-500 text-lg">Complete your order</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <CheckoutForm />
            <OrderSummary />
          </div>
        </div>
      </Container>
    </div>
  );
}

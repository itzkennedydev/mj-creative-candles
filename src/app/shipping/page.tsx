import { Container } from "~/components/ui/container";
import { Truck, Clock, Shield, Package, MapPin, Phone } from "lucide-react";

export default function ShippingInfoPage() {
  return (
    <section className="py-12">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Shipping Options */}
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex items-center">
                  <Truck className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Standard Shipping
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">
                  Free shipping on orders over $50. Standard delivery takes 3-5
                  business days.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Orders under $50: $5.99 shipping</li>
                  <li>• Tracking included</li>
                  <li>• Delivered by USPS</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <div className="mb-4 flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Express Shipping
                  </h3>
                </div>
                <p className="mb-4 text-gray-600">
                  Get your candles faster with our express delivery option.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• 1-2 business days delivery</li>
                  <li>• $12.99 additional fee</li>
                  <li>• Delivered by FedEx</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Times */}
          <div className="mb-16">
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Package className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Order Processing
                  </h3>
                  <p className="text-gray-600">1-2 business days</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Truck className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    In Transit
                  </h3>
                  <p className="text-gray-600">3-5 business days</p>
                </div>

                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <MapPin className="h-8 w-8 text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Delivered
                  </h3>
                  <p className="text-gray-600">At your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Policies */}
          <div className="mb-16">
            <div className="space-y-8">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Shield className="mr-3 h-5 w-5 text-gray-600" />
                  Free Shipping Threshold
                </h3>
                <p className="text-gray-600">
                  Enjoy free standard shipping on all orders over $50. This
                  applies to all products in our collection, including
                  individual candles, gift sets, and seasonal collections.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Truck className="mr-3 h-5 w-5 text-gray-600" />
                  Delivery Areas
                </h3>
                <p className="mb-4 text-gray-600">
                  We currently ship to all 50 US states and territories.
                  International shipping is not available at this time.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Continental United States</li>
                  <li>• Alaska and Hawaii</li>
                  <li>
                    • US Territories (Puerto Rico, US Virgin Islands, etc.)
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Package className="mr-3 h-5 w-5 text-gray-600" />
                  Packaging
                </h3>
                <p className="text-gray-600">
                  Your candles are carefully packaged in eco-friendly materials
                  to ensure they arrive in perfect condition. Each candle is
                  individually wrapped and secured to prevent damage during
                  transit.
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          <div className="mb-16">
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="mb-6 text-center">
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  Track Your Order
                </h3>
                <p className="mb-6 text-gray-600">
                  Once your order ships, you'll receive a tracking number via
                  email. Use our tracking page to monitor your package's
                  journey.
                </p>
                <a
                  href="/track"
                  className="inline-block rounded-lg bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Track Your Order
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Need Help?
            </h2>
            <p className="mb-6 text-gray-600">
              Have questions about shipping or need assistance with your order?
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </a>
              <a
                href="mailto:hello@mjcreativecandles.com"
                className="inline-flex items-center justify-center rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

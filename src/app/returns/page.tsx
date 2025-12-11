import { Container } from "~/components/ui/container";
import {
  RotateCcw,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  Mail,
} from "lucide-react";

export default function ReturnsPage() {
  return (
    <section className="py-12">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* Return Policy Overview */}
          <div className="mb-16">
            <div className="mb-8 rounded-lg border border-gray-200 p-8">
              <div className="mb-4 flex items-center">
                <CheckCircle className="mr-3 h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  30-Day Return Window
                </h3>
              </div>
              <p className="text-lg text-gray-600">
                You have 30 days from the delivery date to return or exchange
                your candles. We want you to be completely satisfied with your
                purchase.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <RotateCcw className="mr-3 h-5 w-5 text-gray-600" />
                  Returns
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Full refund within 30 days</li>
                  <li>• Original packaging required</li>
                  <li>• Free return shipping</li>
                  <li>• Refund processed within 5-7 business days</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Package className="mr-3 h-5 w-5 text-gray-600" />
                  Exchanges
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Exchange for different scent or size</li>
                  <li>• No additional shipping charges</li>
                  <li>• Processed within 3-5 business days</li>
                  <li>• Price difference refunded if applicable</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Return Process */}
          <div className="mb-16">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg font-bold text-blue-600">1</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Contact Us
                  </h3>
                  <p className="text-gray-600">
                    Email us at{" "}
                    <a
                      href="mailto:returns@mjcreativecandles.com"
                      className="text-blue-600 hover:underline"
                    >
                      returns@mjcreativecandles.com
                    </a>
                    or call us at{" "}
                    <a
                      href="tel:+15551234567"
                      className="text-blue-600 hover:underline"
                    >
                      (555) 123-CANDLE
                    </a>
                    with your order number and reason for return.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Get Return Label
                  </h3>
                  <p className="text-gray-600">
                    We'll email you a prepaid return shipping label and return
                    authorization number. No need to pay for return shipping -
                    it's on us!
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg font-bold text-blue-600">3</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Package & Ship
                  </h3>
                  <p className="text-gray-600">
                    Pack your items in the original packaging, attach the return
                    label, and drop off at any USPS location or schedule a
                    pickup.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <span className="text-lg font-bold text-blue-600">4</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Receive Refund or Exchange
                  </h3>
                  <p className="text-gray-600">
                    Once we receive your return, we'll process your refund or
                    send your exchange within 3-5 business days. You'll receive
                    email confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <CheckCircle className="mr-3 h-5 w-5 text-gray-600" />
                  What We Accept
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Unused candles in original packaging</li>
                  <li>• Damaged items during shipping</li>
                  <li>• Wrong items sent by mistake</li>
                  <li>• Defective products</li>
                  <li>• Change of mind (within 30 days)</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <AlertCircle className="mr-3 h-5 w-5 text-gray-600" />
                  What We Cannot Accept
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Used or burned candles</li>
                  <li>• Items without original packaging</li>
                  <li>• Returns after 30 days</li>
                  <li>• Items damaged by customer</li>
                  <li>• Personalized or custom orders</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Special Circumstances */}
          <div className="mb-16">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
                  <Clock className="mr-3 h-5 w-5 text-gray-600" />
                  Holiday Returns
                </h3>
                <p className="text-gray-600">
                  For holiday purchases (November 1st - December 31st), we
                  extend our return window to January 31st to give you extra
                  time to enjoy your candles during the holiday season.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
                  <Package className="mr-3 h-5 w-5 text-gray-600" />
                  Damaged in Transit
                </h3>
                <p className="text-gray-600">
                  If your candles arrive damaged, please contact us immediately
                  with photos of the damage. We'll send a replacement right away
                  at no cost to you.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Questions About Returns?
            </h2>
            <p className="mb-6 text-gray-600">
              Our customer service team is here to help with any questions about
              returns or exchanges.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

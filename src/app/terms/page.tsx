import { Container } from "~/components/ui/container";
import { generateSEOTags } from "~/lib/seo";

export const metadata = generateSEOTags({
  title: "Terms of Service - MJ Creative Candles",
  description:
    "Terms of service for MJ Creative Candles custom gift and candle services. Read our terms and conditions for using our services.",
  url: "https://mjcreativecandles.com/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Container>
        <div className="mx-auto max-w-4xl pb-12 pt-8">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
            Terms of Service
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="mb-8 text-xl text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 text-gray-700">
                By accessing and using MJ Creative Candles services, you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by the above, please do not use
                this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                2. Services Description
              </h2>
              <p className="mb-4 text-gray-700">
                MJ Creative Candles provides custom embroidery services including but
                not limited to:
              </p>
              <ul className="mb-4 list-disc pl-6 text-gray-700">
                <li>Custom embroidery on apparel and accessories</li>
                <li>Logo digitization and design services</li>
                <li>Bulk order processing</li>
                <li>Repair and alteration services</li>
                <li>Design consultation services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                3. Orders and Payment
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Order Process:</strong> All orders must be placed
                  through our official channels. We reserve the right to refuse
                  any order at our discretion.
                </p>
                <p>
                  <strong>Payment Terms:</strong> Payment is required before
                  production begins unless otherwise agreed upon in writing. We
                  accept various payment methods as specified during checkout.
                </p>
                <p>
                  <strong>Pricing:</strong> All prices are subject to change
                  without notice. Current pricing will be confirmed at the time
                  of order placement.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                4. Design and Artwork
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Client Responsibility:</strong> Clients are
                  responsible for providing artwork that they have the right to
                  use. Clients must ensure they have proper authorization for
                  any logos, designs, or artwork submitted.
                </p>
                <p>
                  <strong>Design Approval:</strong> All designs must be approved
                  by the client before production begins. Changes after approval
                  may incur additional charges.
                </p>
                <p>
                  <strong>Copyright:</strong> Clients retain ownership of their
                  original designs. MJ Creative Candles retains the right to use
                  completed work for promotional purposes unless otherwise
                  specified.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                5. Production and Delivery
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Production Time:</strong> Production times vary based
                  on order complexity and current workload. Estimated completion
                  dates will be provided at order placement.
                </p>
                <p>
                  <strong>Quality Control:</strong> All items undergo quality
                  control before delivery. We strive to meet the highest
                  standards of craftsmanship.
                </p>
                <p>
                  <strong>Delivery:</strong> Items can be picked up at our
                  location or delivered for an additional fee. Delivery times
                  are estimates and not guaranteed.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                6. Returns and Refunds
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Quality Issues:</strong> If there is a quality issue
                  with your order, please contact us within 7 days of receipt.
                  We will work to resolve the issue at no additional cost.
                </p>
                <p>
                  <strong>Custom Orders:</strong> Custom embroidered items
                  cannot be returned unless there is a quality defect or error
                  on our part.
                </p>
                <p>
                  <strong>Refund Policy:</strong> Refunds are issued at our
                  discretion and may be subject to restocking fees for
                  non-custom items.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                7. Limitation of Liability
              </h2>
              <p className="mb-4 text-gray-700">
                MJ Creative Candles shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other
                intangible losses, resulting from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">8. Privacy Policy</h2>
              <p className="mb-4 text-gray-700">
                Your privacy is important to us. Please review our Privacy
                Policy, which also governs your use of our services, to
                understand our practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                9. Changes to Terms
              </h2>
              <p className="mb-4 text-gray-700">
                We reserve the right to modify these terms at any time. Changes
                will be effective immediately upon posting. Your continued use
                of our services constitutes acceptance of any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                10. Contact Information
              </h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-gray-700">
                  <strong>MJ Creative Candles</strong>
                  <br />
                  Email: info@mjcreativecandles.com
                  <br />
                  Phone: (555) 123-4567
                  <br />
                  Address: [Your Business Address]
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

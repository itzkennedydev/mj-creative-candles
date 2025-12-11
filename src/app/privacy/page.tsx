import { Container } from "~/components/ui/container";
import { generateSEOTags } from "~/lib/seo";

export const metadata = generateSEOTags({
  title: "Privacy Policy - MJ Creative Candles",
  description:
    "Privacy policy for MJ Creative Candles custom gift and candle services. Learn how we protect and use your personal information.",
  url: "https://mjcreativecandles.com/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Container>
        <div className="mx-auto max-w-4xl pb-12 pt-8">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 md:text-5xl">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none">
            <p className="mb-8 text-xl text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Personal Information:</strong> We collect information
                  you provide directly to us, such as when you create an
                  account, place an order, or contact us for support. This may
                  include:
                </p>
                <ul className="mb-4 list-disc pl-6">
                  <li>
                    Name and contact information (email, phone number, address)
                  </li>
                  <li>
                    Payment information (processed securely through third-party
                    providers)
                  </li>
                  <li>Order history and preferences</li>
                  <li>Design files and artwork you submit</li>
                </ul>
                <p>
                  <strong>Usage Information:</strong> We automatically collect
                  certain information about your use of our website, including:
                </p>
                <ul className="list-disc pl-6">
                  <li>IP address and browser information</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Device information and operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use the information we collect to:</p>
                <ul className="mb-4 list-disc pl-6">
                  <li>Process and fulfill your orders</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send order confirmations and updates</li>
                  <li>Improve our website and services</li>
                  <li>Send promotional materials (with your consent)</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                3. Information Sharing
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>We do not sell your personal information.</strong> We
                  may share your information in the following circumstances:
                </p>
                <ul className="mb-4 list-disc pl-6">
                  <li>
                    <strong>Service Providers:</strong> With third-party vendors
                    who help us operate our business (payment processors,
                    shipping companies, etc.)
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets
                  </li>
                  <li>
                    <strong>Consent:</strong> When you have given us explicit
                    consent to share your information
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. However, no method of transmission
                  over the internet or electronic storage is 100% secure.
                </p>
                <p>
                  <strong>Security Measures Include:</strong>
                </p>
                <ul className="list-disc pl-6">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure payment processing</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authentication</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                5. Cookies and Tracking
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website. Cookies are small data files
                  stored on your device that help us:
                </p>
                <ul className="mb-4 list-disc pl-6">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve website functionality</li>
                </ul>
                <p>
                  You can control cookie settings through your browser
                  preferences, though disabling cookies may affect website
                  functionality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">6. Your Rights</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="mb-4 list-disc pl-6">
                  <li>
                    <strong>Access:</strong> Request access to your personal
                    information
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of
                    inaccurate information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request a copy of your data in
                    a portable format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the
                  information provided below.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">7. Data Retention</h2>
              <p className="mb-4 text-gray-700">
                We retain your personal information for as long as necessary to
                fulfill the purposes outlined in this privacy policy, unless a
                longer retention period is required or permitted by law. Order
                information is typically retained for accounting and customer
                service purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                8. Children's Privacy
              </h2>
              <p className="mb-4 text-gray-700">
                Our services are not directed to children under 13 years of age.
                We do not knowingly collect personal information from children
                under 13. If we become aware that we have collected personal
                information from a child under 13, we will take steps to delete
                such information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">
                9. Changes to This Policy
              </h2>
              <p className="mb-4 text-gray-700">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new privacy policy on
                this page and updating the "Last updated" date. We encourage you
                to review this privacy policy periodically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">10. Contact Us</h2>
              <p className="mb-4 text-gray-700">
                If you have any questions about this privacy policy or our data
                practices, please contact us:
              </p>
              <div className="rounded-lg bg-gray-100 p-4">
                <p className="text-gray-700">
                  <strong>MJ Creative Candles</strong>
                  <br />
                  Email: mjcreativecandles@gmail.com
                  <br />
                  Phone: (309) 373-6017
                  <br />
                  Address: 415 13th St, Moline, IL 61265
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </div>
  );
}

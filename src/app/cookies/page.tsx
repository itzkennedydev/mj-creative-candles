import { Container } from "~/components/ui/container";

export default function CookiePolicyPage() {
  return (
    <main className="pt-20">
      <Container>
        <div className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">
              Cookie Policy
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="mb-6 text-gray-600">Last updated: January 2025</p>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  What Are Cookies
                </h2>
                <p className="mb-4 text-gray-600">
                  Cookies are small text files that are placed on your computer
                  or mobile device when you visit our website. They are widely
                  used to make websites work more efficiently and to provide
                  information to website owners.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  How We Use Cookies
                </h2>
                <p className="mb-4 text-gray-600">
                  MJ Creative Candles uses cookies to enhance your browsing
                  experience and provide you with personalized content. We use
                  cookies for the following purposes:
                </p>
                <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
                  <li>To remember your preferences and settings</li>
                  <li>To keep track of items in your shopping cart</li>
                  <li>To analyze website traffic and usage patterns</li>
                  <li>To improve website functionality and performance</li>
                  <li>To provide personalized content and recommendations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Types of Cookies We Use
                </h2>

                <div className="mb-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Essential Cookies
                  </h3>
                  <p className="mb-2 text-gray-600">
                    These cookies are necessary for the website to function
                    properly. They enable basic functions like page navigation,
                    access to secure areas, and shopping cart functionality.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Examples:</strong> Session cookies, authentication
                    cookies, shopping cart cookies
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Analytics Cookies
                  </h3>
                  <p className="mb-2 text-gray-600">
                    These cookies help us understand how visitors interact with
                    our website by collecting and reporting information
                    anonymously.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Examples:</strong> Google Analytics cookies, page
                    view tracking, user behavior analysis
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Functional Cookies
                  </h3>
                  <p className="mb-2 text-gray-600">
                    These cookies enable enhanced functionality and
                    personalization, such as remembering your preferences and
                    settings.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Examples:</strong> Language preferences, region
                    settings, user interface preferences
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">
                    Marketing Cookies
                  </h3>
                  <p className="mb-2 text-gray-600">
                    These cookies are used to track visitors across websites to
                    display relevant and engaging advertisements.
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Examples:</strong> Social media cookies, advertising
                    network cookies, retargeting cookies
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Third-Party Cookies
                </h2>
                <p className="mb-4 text-gray-600">
                  We may also use third-party services that set cookies on our
                  website, including:
                </p>
                <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
                  <li>
                    <strong>Stripe:</strong> Payment processing and security
                  </li>
                  <li>
                    <strong>Google Analytics:</strong> Website analytics and
                    performance monitoring
                  </li>
                  <li>
                    <strong>Social Media Platforms:</strong> Social sharing and
                    integration features
                  </li>
                  <li>
                    <strong>Email Marketing:</strong> Newsletter and promotional
                    communications
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Managing Your Cookie Preferences
                </h2>
                <p className="mb-4 text-gray-600">
                  You have several options for managing cookies:
                </p>

                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Browser Settings
                  </h3>
                  <p className="mb-2 text-gray-600">
                    Most web browsers allow you to control cookies through their
                    settings. You can:
                  </p>
                  <ul className="mb-2 list-inside list-disc space-y-1 text-gray-600">
                    <li>Block all cookies</li>
                    <li>Block third-party cookies only</li>
                    <li>Delete existing cookies</li>
                    <li>Set preferences for specific websites</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Opt-Out Tools
                  </h3>
                  <p className="mb-2 text-gray-600">
                    You can opt out of certain third-party cookies:
                  </p>
                  <ul className="mb-2 list-inside list-disc space-y-1 text-gray-600">
                    <li>
                      Google Analytics:{" "}
                      <a
                        href="https://tools.google.com/dlpage/gaoptout"
                        className="text-black hover:underline"
                      >
                        Google Analytics Opt-out
                      </a>
                    </li>
                    <li>
                      Advertising networks:{" "}
                      <a
                        href="http://www.aboutads.info/choices/"
                        className="text-black hover:underline"
                      >
                        Digital Advertising Alliance
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Impact of Disabling Cookies
                </h2>
                <p className="mb-4 text-gray-600">
                  If you choose to disable cookies, some features of our website
                  may not function properly:
                </p>
                <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
                  <li>Shopping cart may not remember your items</li>
                  <li>You may need to re-enter information repeatedly</li>
                  <li>
                    Personalized content and recommendations may not be
                    available
                  </li>
                  <li>Some website features may not work as expected</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Cookie Retention
                </h2>
                <p className="mb-4 text-gray-600">
                  Different cookies have different lifespans:
                </p>
                <ul className="mb-4 list-inside list-disc space-y-2 text-gray-600">
                  <li>
                    <strong>Session Cookies:</strong> Deleted when you close
                    your browser
                  </li>
                  <li>
                    <strong>Persistent Cookies:</strong> Remain on your device
                    for a set period (typically 30 days to 2 years)
                  </li>
                  <li>
                    <strong>Essential Cookies:</strong> May persist longer to
                    maintain website functionality
                  </li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Updates to This Policy
                </h2>
                <p className="mb-4 text-gray-600">
                  We may update this Cookie Policy from time to time to reflect
                  changes in our practices or for other operational, legal, or
                  regulatory reasons. We will notify you of any material changes
                  by posting the updated policy on this page.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                  Contact Us
                </h2>
                <p className="mb-4 text-gray-600">
                  If you have any questions about our use of cookies, please
                  contact us:
                </p>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-gray-600">
                    <strong>Email:</strong> hello@mjcreativecandles.com
                    <br />
                    <strong>Phone:</strong> (555) 123-CANDLE
                    <br />
                    <strong>Address:</strong> Hand-poured in the USA
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

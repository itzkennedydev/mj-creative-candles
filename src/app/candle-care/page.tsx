import { Container } from "~/components/ui/container";
import {
  Flame,
  Scissors,
  Wind,
  Shield,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
} from "lucide-react";

export default function CandleCarePage() {
  return (
    <section className="py-12">
      <Container>
        <div className="mx-auto max-w-4xl">
          {/* First Burn */}
          <div className="mb-16">
            <div className="mb-8 rounded-lg border border-gray-200 p-8">
              <div className="mb-4 flex items-center">
                <Flame className="mr-3 h-6 w-6 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  The First Burn Rule
                </h3>
              </div>
              <p className="mb-4 text-lg text-gray-600">
                The first time you light your candle, let it burn until the
                entire top layer of wax becomes liquid. This prevents
                "tunneling" and ensures even burning throughout the candle's
                life.
              </p>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="font-semibold text-gray-800">
                  💡 Pro Tip: This usually takes 2-4 hours depending on the
                  candle size.
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <CheckCircle className="mr-3 h-5 w-5 text-gray-600" />
                  Do This
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Burn for 2-4 hours on first use</li>
                  <li>• Let wax pool reach the edges</li>
                  <li>• Trim wick to 1/4 inch before each burn</li>
                  <li>• Keep burning until wax is completely melted</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <AlertTriangle className="mr-3 h-5 w-5 text-gray-600" />
                  Avoid This
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Blowing out before wax pools completely</li>
                  <li>• Burning for less than 1 hour</li>
                  <li>• Moving candle while wax is liquid</li>
                  <li>• Burning near drafts or vents</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Wick Care */}
          <div className="mb-16">
            <div className="space-y-8">
              <div className="rounded-lg border border-gray-200 p-8">
                <div className="mb-6 flex items-center">
                  <Scissors className="mr-3 h-6 w-6 text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Trimming Your Wick
                  </h3>
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                      When to Trim
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Before each burn</li>
                      <li>• When wick is longer than 1/4 inch</li>
                      <li>• If flame is too large or flickering</li>
                      <li>• If you see black smoke</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-4 text-lg font-semibold text-gray-900">
                      How to Trim
                    </h4>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Use wick trimmers or nail clippers</li>
                      <li>• Trim to 1/4 inch length</li>
                      <li>• Remove any debris or mushrooming</li>
                      <li>• Ensure wick is centered</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                <div className="mb-4 flex items-center">
                  <Lightbulb className="mr-3 h-6 w-6 text-yellow-600" />
                  <h3 className="text-xl font-semibold text-yellow-800">
                    Wick Trimming Benefits
                  </h3>
                </div>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Prevents excessive smoke and soot</li>
                  <li>• Ensures even burning</li>
                  <li>• Extends candle life</li>
                  <li>• Maintains optimal fragrance throw</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Safety Guidelines */}
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Shield className="mr-3 h-5 w-5 text-gray-600" />
                  Safety Rules
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Never leave burning candles unattended</li>
                  <li>• Keep away from children and pets</li>
                  <li>• Place on stable, heat-resistant surface</li>
                  <li>• Keep away from flammable materials</li>
                  <li>• Don't burn for more than 4 hours at a time</li>
                  <li>• Stop burning when 1/2 inch of wax remains</li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                  <Wind className="mr-3 h-5 w-5 text-gray-600" />
                  Optimal Conditions
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li>• Burn in well-ventilated room</li>
                  <li>• Avoid drafts and air conditioning</li>
                  <li>• Room temperature should be stable</li>
                  <li>• Use candle holders or plates</li>
                  <li>• Keep wick centered while burning</li>
                  <li>• Store in cool, dry place when not in use</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mb-16">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Problem: Tunneling
                </h3>
                <p className="mb-4 text-gray-600">
                  A tunnel forms when the candle doesn't burn evenly, leaving
                  wax around the edges.
                </p>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-800">Solution:</p>
                  <p className="text-gray-700">
                    Wrap aluminum foil around the top of the candle, leaving a
                    small opening for the flame. This will help melt the wax
                    around the edges.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Problem: Weak Scent
                </h3>
                <p className="mb-4 text-gray-600">
                  The candle doesn't seem to have a strong fragrance throw.
                </p>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-800">Solution:</p>
                  <p className="text-gray-700">
                    Ensure the candle is burning long enough for the wax to pool
                    completely. The fragrance is released when the wax melts.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Problem: Soot or Smoke
                </h3>
                <p className="mb-4 text-gray-600">
                  Black smoke or soot appears when burning.
                </p>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-gray-800">Solution:</p>
                  <p className="text-gray-700">
                    Trim the wick to 1/4 inch and ensure there are no drafts. A
                    properly trimmed wick should burn cleanly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Tips */}
          <div className="mb-16">
            <div className="rounded-lg border border-gray-200 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Proper Storage
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li>• Store in cool, dry place</li>
                    <li>• Keep away from direct sunlight</li>
                    <li>• Store upright to prevent warping</li>
                    <li>• Keep in original packaging if possible</li>
                    <li>• Avoid extreme temperature changes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Cleaning Tips
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li>• Clean jar with warm, soapy water</li>
                    <li>• Remove any remaining wax carefully</li>
                    <li>• Dry thoroughly before reuse</li>
                    <li>• Use cotton swabs for hard-to-reach areas</li>
                    <li>• Avoid harsh chemicals or abrasives</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="text-center">
            <h2 className="mb-8 text-3xl font-bold text-gray-900">
              Need More Help?
            </h2>
            <p className="mb-6 text-gray-600">
              Have questions about candle care or need personalized advice?
              We're here to help!
            </p>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

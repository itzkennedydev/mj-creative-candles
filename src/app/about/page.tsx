"use client";

import { useState, useEffect } from "react";
import { Container } from "~/components/ui/container";
import Image from "next/image";
import { Heart, Award, Leaf } from "lucide-react";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for images and content
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-96 animate-pulse bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* The Beginning Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-50 py-16 sm:py-20">
        <Container>
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                The Beginning
              </h1>
              <p className="mb-6 leading-relaxed text-gray-600">
                When the world shut down in 2020, Marteze and Jazden found
                themselves with extra time and a shared love for creating. What
                started as a simple candle-making experiment in their kitchen
                quickly became an obsession with perfecting the art of scent and
                wax.
              </p>
              <p className="leading-relaxed text-gray-600">
                After months of trial and error, countless test burns, and
                feedback from friends and family, they realized they had created
                something special. The candles weren&apos;t just products - they
                were experiences that brought comfort and joy during uncertain
                times.
              </p>
            </div>
            <div className="relative h-80 overflow-hidden rounded-lg">
              <Image
                src="/images/featured/F3.png"
                alt="Early candle making experiments"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Process Section */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Crafting Process
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Every candle is carefully crafted through a meticulous process
              that ensures the highest quality and most beautiful scents.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Select Premium Materials
              </h3>
              <p className="text-sm text-gray-600">
                We source only the finest soy wax and premium fragrance oils
                from trusted suppliers.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Hand-Pour with Care
              </h3>
              <p className="text-sm text-gray-600">
                Each candle is carefully hand-poured in small batches to ensure
                perfect consistency.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Cure for Perfection
              </h3>
              <p className="text-sm text-gray-600">
                Candles are cured for 2 to 3 weeks to develop the strongest,
                most delicious scents.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl font-bold text-gray-900">4</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Quality Check
              </h3>
              <p className="text-sm text-gray-600">
                Every candle undergoes rigorous quality testing before being
                packaged and shipped.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Everything we do is guided by our commitment to quality,
              sustainability, and creating moments of joy.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Award className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Quality First
              </h3>
              <p className="text-gray-600">
                We use only the finest soy wax and premium fragrance oils to
                ensure every candle burns cleanly and fills your space with
                beautiful, long-lasting scents.
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Heart className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Handcrafted with Love
              </h3>
              <p className="text-gray-600">
                Each candle is carefully hand-poured in small batches, allowing
                us to maintain the highest standards and create unique, personal
                touches in every piece.
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Leaf className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                Eco-Friendly
              </h3>
              <p className="text-gray-600">
                We&apos;re committed to sustainability, using natural soy wax
                and cotton wicks that are better for you and the environment.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Founders Story Section */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                Meet the Founders
              </h2>
              <p className="text-lg text-gray-600">
                The entrepreneurial siblings who turned a pandemic hobby into a
                thriving business
              </p>
            </div>

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src="/images/owners/J_optimized.jpg"
                    alt="Marteze"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Marteze
                </h3>
                <p className="mb-4 text-gray-600">
                  Co-Founder & Creative Director
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  The creative visionary behind our unique scent combinations
                  and beautiful packaging designs. Marteze has an incredible
                  nose for fragrance and spends hours perfecting each blend to
                  create the perfect olfactory experience.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                  <Image
                    src="/images/owners/M_optimized.jpg"
                    alt="Jazden"
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Jazden
                </h3>
                <p className="mb-4 text-gray-600">
                  Co-Founder & Operations Manager
                </p>
                <p className="text-sm leading-relaxed text-gray-600">
                  The detail-oriented perfectionist who ensures every candle
                  meets our high standards. Jazden manages the day-to-day
                  operations, quality control, and customer experience, making
                  sure every order is perfect.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

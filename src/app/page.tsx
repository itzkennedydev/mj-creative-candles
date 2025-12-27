// MJ Creative Candles Storefront

"use client";

import { useState, useEffect, lazy, Suspense, memo } from "react";
import Image from "next/image";
import { HeroSlider } from "~/components/sections/hero-slider";
import { FeaturesSection } from "~/components/sections/features-section";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { Skeleton } from "~/components/ui/skeleton";

// Lazy load heavy components to improve initial bundle size and prevent mobile crashes
const CategorySection = lazy(() =>
  import("~/components/sections/category-section").then((mod) => ({
    default: mod.CategorySection,
  }))
);

const FeaturedProducts = lazy(() =>
  import("~/components/sections/featured-products").then((mod) => ({
    default: mod.FeaturedProducts,
  }))
);

const AboutSection = lazy(() =>
  import("~/components/sections/about-section").then((mod) => ({
    default: mod.AboutSection,
  }))
);

export default function HomePage() {
  const [loading, setLoading] = useState(true);

  // Set loading to false after initial render
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Skeleton */}
        <div className="relative h-96 bg-gray-100">
          <Skeleton className="h-full w-full" />
        </div>

        <FeaturesSection />

        {/* Banner Skeleton */}
        <section className="w-full bg-gradient-to-br from-gray-100 to-gray-50">
          <div className="relative h-64 w-full overflow-hidden rounded-sm sm:h-80 lg:h-96">
            <Skeleton className="h-full w-full" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSlider />

      <FeaturesSection />

      <Suspense
        fallback={
          <section className="mb-[90px] bg-white py-12 sm:py-16">
            <Container>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-sm sm:h-96" />
                ))}
              </div>
            </Container>
          </section>
        }
      >
        <CategorySection />
      </Suspense>

      <Suspense
        fallback={
          <section className="mb-[90px] bg-white py-12 sm:py-16">
            <Container>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-sm" />
                ))}
              </div>
            </Container>
          </section>
        }
      >
        <FeaturedProducts />
      </Suspense>

      <Suspense
        fallback={
          <section className="mb-[90px] bg-white py-12 sm:py-16">
            <Container>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <Skeleton className="h-96 rounded-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-80 rounded-sm" />
                  <Skeleton className="h-80 rounded-sm" />
                </div>
              </div>
            </Container>
          </section>
        }
      >
        <AboutSection />
      </Suspense>

      {/* Banner Section */}
      <section className="w-full bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="relative h-64 w-full overflow-hidden rounded-sm sm:h-80 lg:h-96">
          <Image
            src="/images/banner_optimized.jpg"
            alt="MJ Creative Candles Banner"
            fill
            loading="lazy"
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="text-center">
            <div className="rounded-2xl bg-gray-50 p-8 sm:p-12">
              <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
                Stay Connected with Our Journey
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
                Join our community and be the first to know about new scents,
                special offers, and behind-the-scenes stories from our
                candle-making journey.
              </p>

              <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 rounded-sm border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
                <Button className="h-12 whitespace-nowrap rounded-sm bg-black px-8 py-3 text-white hover:bg-gray-800">
                  Subscribe
                </Button>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Get 10% off your first order + exclusive access to new releases
              </p>

              {/* Social Media Links */}
              <div className="mt-6 flex items-center justify-center space-x-6">
                <a
                  href="https://www.instagram.com/mjscreativecandles/?hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-pink-500"
                  aria-label="Follow us on Instagram"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/mjscreativecandles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition-colors hover:text-blue-600"
                  aria-label="Follow us on Facebook"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Gallery Section - Lazy load images */}
      <section className="hidden w-full sm:block">
        <div className="grid grid-cols-2 gap-0 sm:grid-cols-4 lg:grid-cols-8">
          <Image
            src="/images/lowergal/optimized_1g.png"
            alt="Gallery Image 1"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_2g.png"
            alt="Gallery Image 2"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_3g.png"
            alt="Gallery Image 3"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_4g.png"
            alt="Gallery Image 4"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_5g.png"
            alt="Gallery Image 5"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_6.png"
            alt="Gallery Image 6"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_7g.png"
            alt="Gallery Image 7"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
          <Image
            src="/images/lowergal/optimized_8g.png"
            alt="Gallery Image 8"
            width={320}
            height={256}
            loading="lazy"
            className="h-32 w-full object-cover sm:h-40 lg:h-48"
          />
        </div>
      </section>
    </div>
  );
}

"use client";

import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();

  return (
    <section
      className={`relative py-8 sm:py-12 md:py-16 lg:py-24 ${true ? "bg-gradient-to-b from-white to-gray-50" : "bg-white"}`}
    >
      <Container>
        <div className="grid min-h-[24rem] grid-cols-1 items-center gap-8 sm:min-h-[28rem] sm:gap-8 md:min-h-[32rem] md:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 space-y-8 text-center sm:space-y-6 md:space-y-8 lg:order-1 lg:text-left"
          >
            {/* Main Heading */}
            <h1 className="text-3xl font-bold leading-tight text-[#1d1d1f] sm:text-5xl md:text-4xl lg:text-5xl">
              {/* Mobile - Better line breaks */}
              <span className="md:hidden">
                Bring Your <span className="text-[#1d1d1f]">Ideas</span> to Life
                <br />
                at{" "}
                <span className="bg-[#737373]/40 px-2 text-[#1d1d1f]">
                  MJ Creative Candles
                </span>
              </span>

              {/* Desktop version with two lines */}
              <span className="hidden md:block">
                <span className="block">
                  Bring Your <span className="text-[#1d1d1f]">Ideas</span> to
                  Life
                </span>
                <span className="mt-2 block">
                  at
                  <span className="relative ml-4 inline-block">
                    <span className="relative z-10 px-2 text-[#1d1d1f]">
                      MJ Creative Candles
                    </span>
                    <span className="absolute inset-0 -left-2 -right-2 z-0 bg-[#737373]/40"></span>
                  </span>
                </span>
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-lg text-base text-[#1d1d1f]/70 sm:text-lg">
              Handcrafted candles made with premium materials. Transform your
              space with our curated collection of artisanal candles.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="w-full rounded-xl bg-[#1d1d1f] px-8 py-3 font-semibold text-white hover:bg-[#0a0a0a] sm:w-auto"
                onClick={() => router.push("/shop")}
              >
                Shop
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full bg-gray-100 font-medium text-[#1d1d1f] hover:bg-gray-200 sm:w-auto"
                onClick={() =>
                  window.open(
                    "https://maps.google.com/?q=415+13th+St,+Moline+IL+61265",
                    "_blank",
                  )
                }
              >
                Get Directions
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 sm:pt-4">
              <p className="mb-4 text-xs text-[#1d1d1f]/50 sm:mb-4 sm:text-sm">
                Trusted by local businesses and individuals
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-4 md:gap-8 lg:justify-start">
                <div className="flex items-center justify-center lg:justify-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#737373] sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#737373] sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#737373] sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#737373] sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#737373] sm:h-5 sm:w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-[#1d1d1f]/80 sm:ml-2 sm:text-base">
                    4.9/5
                  </span>
                </div>
                <div className="text-sm font-medium text-[#1d1d1f]/80 sm:text-base">
                  500+ Happy Customers
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="relative h-[20rem] rotate-1 overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:rotate-0 hover:shadow-xl sm:h-[24rem] sm:rounded-2xl sm:shadow-2xl md:h-[28rem] lg:h-[32rem]">
              <Image
                src="/Van.jpg"
                alt="MJ Creative Candles storefront"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 640px"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1d1d1f]/30 via-transparent to-transparent" />

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-gray-200/30 blur-2xl"></div>
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-gray-50 blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

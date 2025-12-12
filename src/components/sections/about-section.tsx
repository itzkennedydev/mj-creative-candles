"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";

// Helper to get memory info
const getMemoryInfo = () => {
  if (typeof window !== "undefined" && (performance as any).memory) {
    const mem = (performance as any).memory;
    return {
      usedJSHeapSize: (mem.usedJSHeapSize / 1048576).toFixed(2) + "MB",
      totalJSHeapSize: (mem.totalJSHeapSize / 1048576).toFixed(2) + "MB",
    };
  }
  return null;
};

export function AboutSection() {
  useEffect(() => {
    console.log("[ABOUT SECTION] 🚀 Component mounted", {
      timestamp: new Date().toISOString(),
      memory: getMemoryInfo(),
    });

    return () => {
      console.log("[ABOUT SECTION] 🔚 Component unmounting", {
        timestamp: new Date().toISOString(),
        memory: getMemoryInfo(),
      });
    };
  }, []);

  return (
    <section className="mb-[90px] bg-white py-12 sm:py-16">
      <Container>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Text Content - Left Side */}
          <div className="space-y-6">
            {/* Instagram Handle */}
            <div className="mb-6 flex items-center gap-3">
              <svg
                className="h-6 w-6 text-black"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                @MJCREATIVE_CANDLES
              </span>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">
                Our Story in Scents
              </h3>
              <p className="leading-relaxed text-gray-600">
                MJ&apos;s Creative Candles is a small business born out of
                passion. When the pandemic hit, entrepreneurial siblings Marteze
                and Jazden decided to turn their candle-making hobby into an
                opportunity. They hand-pour each candle in small batches and
                cure them for two to three weeks to achieve the strongest, most
                delicious scents.
              </p>
            </div>

            <Button className="bg-black text-white hover:bg-gray-800">
              Learn More About Us
            </Button>
          </div>

          {/* Owner Images - Right Side, Side by Side with Vertical Stagger */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {/* J.jpg - Left Side, Higher */}
            <div className="relative mt-4 h-80 overflow-hidden rounded-sm bg-white sm:mt-6 sm:h-96 lg:h-[28rem]">
              <Image
                src="/images/owners/J_optimized.jpg"
                alt="Marteze - Co-founder of MJ Creative Candles"
                fill
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </div>

            {/* M.png - Right Side, Lower */}
            <div className="relative mt-8 h-80 overflow-hidden rounded-sm bg-white sm:mt-12 sm:h-96 lg:h-[28rem]">
              <Image
                src="/images/owners/M_optimized.jpg"
                alt="Jazden - Co-founder of MJ Creative Candles"
                fill
                className="object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

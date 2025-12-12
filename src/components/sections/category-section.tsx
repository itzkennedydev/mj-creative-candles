"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/ui/container";

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

interface CategoryCard {
  id: number;
  title: string;
  image: string;
  label: string;
  link: string;
}

const categories: CategoryCard[] = [
  {
    id: 1,
    title: "Most Popular",
    image: "/images/featured/optimized_F1.png",
    label: "MOST POPULAR",
    link: "/shop?category=best-sellers",
  },
  {
    id: 2,
    title: "Limited Time",
    image: "/images/featured/optimized_F2.png",
    label: "LIMITED TIME",
    link: "/shop?category=limited-edition",
  },
  {
    id: 3,
    title: "Gift Sets",
    image: "/images/featured/optimized_F3.png",
    label: "GIFT SETS",
    link: "/shop?category=gift-sets",
  },
  {
    id: 4,
    title: "Seasonal",
    image: "/images/featured/optimized_F1.png", // Using F1 as placeholder until F4 is added
    label: "SEASONAL",
    link: "/shop?category=seasonal",
  },
];

export function CategorySection() {
  useEffect(() => {
    console.log("[CATEGORY SECTION] 🚀 Component mounted", {
      timestamp: new Date().toISOString(),
      memory: getMemoryInfo(),
    });

    return () => {
      console.log("[CATEGORY SECTION] 🔚 Component unmounting", {
        timestamp: new Date().toISOString(),
        memory: getMemoryInfo(),
      });
    };
  }, []);

  return (
    <section className="mb-[90px] bg-white py-12 sm:py-16">
      <Container>
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-3 text-xl font-semibold text-gray-800 sm:mb-4 sm:text-2xl lg:text-3xl">
            Find Your Perfect Scents
          </h2>
          <p className="mx-auto max-w-2xl px-4 text-sm text-gray-700 sm:text-base">
            Discover our range of hand-poured soy candles, categorized to help
            you easily find options to set the mood in any room or find the
            perfect gift.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid h-auto grid-cols-1 gap-4 sm:h-[500px] sm:grid-cols-2 sm:gap-6 lg:h-[600px] lg:grid-cols-4">
          {/* Long rectangle on the left */}
          <Link
            href={categories[3]?.link ?? "/shop"}
            className="group relative block h-[250px] cursor-pointer sm:col-span-2 sm:h-full lg:col-span-2"
          >
            <div className="relative h-full overflow-hidden rounded-sm">
              <Image
                src={categories[3]?.image ?? "/images/placeholder-candle.jpg"}
                alt={categories[3]?.title ?? "Category"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30"></div>

              {/* Category Label */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform sm:bottom-4">
                <div className="rounded-sm bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-900 sm:text-sm">
                    {categories[3]?.label ?? "Category"}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Two smaller squares stacked in the middle */}
          <div className="flex flex-col gap-4 sm:col-span-1 sm:gap-6 lg:col-span-1">
            <Link
              href={categories[1]?.link ?? "/shop"}
              className="group relative block h-[180px] flex-1 cursor-pointer sm:h-full"
            >
              <div className="relative h-full overflow-hidden rounded-sm">
                <Image
                  src={categories[1]?.image ?? "/images/placeholder-candle.jpg"}
                  alt={categories[1]?.title ?? "Category"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30"></div>

                {/* Category Label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform sm:bottom-4">
                  <div className="rounded-sm bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-900 sm:text-sm">
                      {categories[1]?.label ?? "Category"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href={categories[2]?.link ?? "/shop"}
              className="group relative block h-[180px] flex-1 cursor-pointer sm:h-full"
            >
              <div className="relative h-full overflow-hidden rounded-sm">
                <Image
                  src={categories[2]?.image ?? "/images/placeholder-candle.jpg"}
                  alt={categories[2]?.title ?? "Category"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30"></div>

                {/* Category Label */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform sm:bottom-4">
                  <div className="rounded-sm bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-900 sm:text-sm">
                      {categories[2]?.label ?? "Category"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Large square on the right */}
          <div className="group relative h-[250px] cursor-pointer sm:col-span-2 sm:h-full lg:col-span-1">
            <div className="relative h-full overflow-hidden rounded-sm">
              <Image
                src={categories[0]?.image ?? "/images/placeholder-candle.jpg"}
                alt={categories[0]?.title ?? "Category"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30"></div>

              {/* Category Label */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 transform sm:bottom-4">
                <div className="rounded-sm bg-white px-3 py-1.5 shadow-sm sm:px-4 sm:py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-900 sm:text-sm">
                    {categories[0]?.label ?? "Category"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

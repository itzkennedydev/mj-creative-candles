'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '~/components/ui/container';

// Helper to get memory info
const getMemoryInfo = () => {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const mem = (performance as any).memory;
    return {
      usedJSHeapSize: (mem.usedJSHeapSize / 1048576).toFixed(2) + 'MB',
      totalJSHeapSize: (mem.totalJSHeapSize / 1048576).toFixed(2) + 'MB'
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
    image: "/images/featured/F1.png",
    label: "MOST POPULAR",
    link: "/shop?category=best-sellers"
  },
  {
    id: 2,
    title: "Limited Time",
    image: "/images/featured/F2.png",
    label: "LIMITED TIME",
    link: "/shop?category=limited-edition"
  },
  {
    id: 3,
    title: "Gift Sets",
    image: "/images/featured/F3.png",
    label: "GIFT SETS",
    link: "/shop?category=gift-sets"
  },
  {
    id: 4,
    title: "Seasonal",
    image: "/images/featured/F4.png",
    label: "SEASONAL",
    link: "/shop?category=seasonal"
  }
];

export function CategorySection() {
  useEffect(() => {
    console.log('[CATEGORY SECTION] 🚀 Component mounted', {
      timestamp: new Date().toISOString(),
      memory: getMemoryInfo()
    });
    
    return () => {
      console.log('[CATEGORY SECTION] 🔚 Component unmounting', {
        timestamp: new Date().toISOString(),
        memory: getMemoryInfo()
      });
    };
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white mb-[90px]">
      <Container>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4">
            Find Your Perfect Scents
          </h2>
          <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto px-4">
            Discover our range of hand-poured soy candles, categorized to help you easily find options to set the mood in any room or find the perfect gift.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 h-auto sm:h-[500px] lg:h-[600px]">
          {/* Long rectangle on the left */}
          <Link href={categories[3]?.link ?? "/shop"} className="sm:col-span-2 lg:col-span-2 relative group cursor-pointer h-[250px] sm:h-full block">
            <div className="relative h-full overflow-hidden rounded-sm">
              <Image
                src={categories[3]?.image ?? "/images/placeholder-candle.jpg"}
                alt={categories[3]?.title ?? "Category"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              
              {/* Category Label */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm shadow-sm">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    {categories[3]?.label ?? "Category"}
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Two smaller squares stacked in the middle */}
          <div className="sm:col-span-1 lg:col-span-1 flex flex-col gap-4 sm:gap-6">
            <Link href={categories[1]?.link ?? "/shop"} className="relative group cursor-pointer flex-1 h-[180px] sm:h-full block">
              <div className="relative h-full overflow-hidden rounded-sm">
                <Image
                  src={categories[1]?.image ?? "/images/placeholder-candle.jpg"}
                  alt={categories[1]?.title ?? "Category"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                
                {/* Category Label */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm shadow-sm">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {categories[1]?.label ?? "Category"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href={categories[2]?.link ?? "/shop"} className="relative group cursor-pointer flex-1 h-[180px] sm:h-full block">
              <div className="relative h-full overflow-hidden rounded-sm">
                <Image
                  src={categories[2]?.image ?? "/images/placeholder-candle.jpg"}
                  alt={categories[2]?.title ?? "Category"}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                
                {/* Category Label */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm shadow-sm">
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      {categories[2]?.label ?? "Category"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Large square on the right */}
          <div className="sm:col-span-2 lg:col-span-1 relative group cursor-pointer h-[250px] sm:h-full">
            <div className="relative h-full overflow-hidden rounded-sm">
              <Image
                    src={categories[0]?.image ?? "/images/placeholder-candle.jpg"}
                    alt={categories[0]?.title ?? "Category"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
              
              {/* Category Label */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm shadow-sm">
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wide">
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

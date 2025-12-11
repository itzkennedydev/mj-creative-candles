"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

interface BrandImage {
  src: string;
  alt: string;
}

const brandImages: BrandImage[] = [
  { src: "/brands/logo1.png", alt: "Early Learning Academy" },
  { src: "/brands/logo2.png", alt: "UF Soccer" },
  { src: "/brands/logo3.png", alt: "Powersorts" },
  { src: "/brands/logo4.png", alt: "IHSAA" },
  { src: "/brands/logo5.png", alt: "Elfogon" },
  { src: "/brands/logo6.png", alt: "Speeding Logistics" },
];

export function BrandsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const intervalId = setInterval(scroll, 30);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="pt-4 bg-white overflow-hidden">
      <div className="container mx-auto">
        <h2 className="text-base text-[#475467] text-center mb-8 font-medium">
          Brands Sporting Our Personal Touches
        </h2>
        <div className="relative">
          {/* Left fade gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10" />
          
          <div 
            ref={scrollRef}
            className="flex gap-8 items-center overflow-hidden whitespace-nowrap w-full"
          >
            {[...brandImages, ...brandImages].map((brand, index) => (
              <div
                key={index}
                className="flex-none w-[100px] h-[40px] sm:w-[130px] sm:h-[52px] md:w-[160px] md:h-[64px] relative grayscale hover:grayscale-0 transition-all duration-300"
              >
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100px, (max-width: 768px) 130px, 160px"
                />
              </div>
            ))}
          </div>

          {/* Right fade gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10" />
        </div>
      </div>
    </section>
  );
}
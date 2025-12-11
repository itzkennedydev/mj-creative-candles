"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { useCart } from "~/lib/cart-context";
import { useEffect, useState } from "react";

export function HeroSlider() {
  const { openScentQuiz } = useCart();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative h-[400px] overflow-hidden sm:h-[500px] lg:h-[600px]">
      <div className="relative h-full w-full">
        <Image
          src="/images/hero/hero.jpg"
          alt="Premium Handcrafted Candles"
          fill
          className="object-cover object-bottom"
          priority
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl px-4 text-center text-white sm:px-6">
            <h3 className="mb-3 text-3xl font-bold drop-shadow-lg sm:mb-4 sm:text-4xl lg:text-5xl">
              Premium Handcrafted Candles
            </h3>
            <p className="mx-auto mb-6 max-w-2xl text-base drop-shadow-md sm:mb-8 sm:text-lg lg:text-xl">
              Discover our collection of artisanal candles made with love and
              care
            </p>
            {isMobile ? (
              <Link href="/shop">
                <Button className="bg-white px-6 py-2 text-sm text-black shadow-lg hover:bg-gray-100 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base">
                  Discover Your Scent
                </Button>
              </Link>
            ) : (
              <Button
                onClick={openScentQuiz}
                className="bg-white px-6 py-2 text-sm text-black shadow-lg hover:bg-gray-100 hover:shadow-xl sm:px-8 sm:py-3 sm:text-base"
              >
                Discover Your Scent
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

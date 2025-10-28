"use client";

import { useEffect } from "react";
import { Hero } from "~/components/sections/hero";
import { BrandsSection } from "~/components/sections/brands";
import { Categories } from "~/components/sections/categories";
import { CtaSection } from "~/components/sections/cta"
import { StitchingShowcase } from "~/components/sections/stitching-showcase"
import { WhyChoose } from "~/components/sections/why-choose"
import { Gallery } from "~/components/sections/gallery"
import { EventPopup } from "~/components/event-popup";
import { usePrefetchProducts } from "~/lib/hooks/use-products";

export default function Home() {
  const prefetchProducts = usePrefetchProducts();

  // Prefetch products on home page load for instant shop loading
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);
  return (
    <div className="space-y-2 md:space-y-6 pb-8">
      <Hero />
      <BrandsSection />
      <Categories />
      <CtaSection />
      <StitchingShowcase />
      <WhyChoose />
      <Gallery />
      {/* Other sections */}
      <EventPopup />
    </div>
  );
}

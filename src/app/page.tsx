"use client";

import { useEffect, Suspense, lazy } from "react";
import { Hero } from "~/components/sections/hero";
import { usePrefetchProducts } from "~/lib/hooks/use-products";

// Lazy load heavy components for better initial load performance
const BrandsSection = lazy(() => import("~/components/sections/brands").then(m => ({ default: m.BrandsSection })));
const Categories = lazy(() => import("~/components/sections/categories").then(m => ({ default: m.Categories })));
const CtaSection = lazy(() => import("~/components/sections/cta").then(m => ({ default: m.CtaSection })));
const StitchingShowcase = lazy(() => import("~/components/sections/stitching-showcase").then(m => ({ default: m.StitchingShowcase })));
const WhyChoose = lazy(() => import("~/components/sections/why-choose").then(m => ({ default: m.WhyChoose })));
const Gallery = lazy(() => import("~/components/sections/gallery").then(m => ({ default: m.Gallery })));

// Loading fallback component
const SectionSkeleton = () => (
  <div className="w-full h-64 bg-neutral-50 animate-pulse rounded-lg" />
);

export default function Home() {
  const prefetchProducts = usePrefetchProducts();

  // Prefetch products on home page load for instant shop loading
  useEffect(() => {
    prefetchProducts();
  }, [prefetchProducts]);
  
  return (
    <div className="space-y-2 md:space-y-6 pb-8">
      <Hero />
      <Suspense fallback={<SectionSkeleton />}>
        <BrandsSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <Categories />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <CtaSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <StitchingShowcase />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <WhyChoose />
      </Suspense>
      <Suspense fallback={<SectionSkeleton />}>
        <Gallery />
      </Suspense>
    </div>
  );
}

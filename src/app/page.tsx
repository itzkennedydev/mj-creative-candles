"use client";

import { Hero } from "~/components/sections/hero";
import { BrandsSection } from "~/components/sections/brands";
import { Categories } from "~/components/sections/categories";
import { CtaSection } from "~/components/sections/cta"
import { StitchingShowcase } from "~/components/sections/stitching-showcase"
import { WhyChoose } from "~/components/sections/why-choose"
import { Gallery } from "~/components/sections/gallery"
import { EventPopup } from "~/components/event-popup";

export default function Home() {
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
      
      {/* Debug button - remove this after testing */}
      <div className="fixed bottom-4 right-4 z-[10000]">
        <button 
          onClick={() => {
            localStorage.removeItem('event-popup-dismissed');
            window.location.reload();
          }}
          className="bg-red-500 text-white px-3 py-1 text-xs rounded"
        >
          Reset Popup
        </button>
      </div>
    </div>
  );
}

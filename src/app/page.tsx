import { Hero } from "~/components/sections/hero";
import { BrandsSection } from "~/components/sections/brands";
import { Categories } from "~/components/sections/categories";
import { CtaSection } from "~/components/sections/cta"
import { StitchingShowcase } from "~/components/sections/stitching-showcase"

export default function Home() {
  return (
    <div className="space-y-4 md:space-y-10 pb-8">
      <Hero />
      <BrandsSection />
      <Categories />
      <CtaSection />
      <StitchingShowcase />
      {/* Other sections */}
    </div>
  );
}

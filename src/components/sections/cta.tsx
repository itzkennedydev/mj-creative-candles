import Image from "next/image"
import { Button } from "~/components/ui/button"
import { Container } from "~/components/ui/container"

export function CtaSection() {
  return (
    <Container>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 md:py-24">
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Speed and Precision <br className="hidden sm:block" />
            in Every Seam
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-[1.75]">
            At Stitch Please, we redefine the standard for fast and quality service. 
            Our commitment to speed doesn&apos;t compromise the impeccable craftsmanship that sets us apart.
          </p>
          <div className="pt-4">
            <Button size="lg" className="w-full sm:w-auto bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90">
              Get Started
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Image
              src="/CTA/1.jpg"
              alt="Embroidered sports wear" 
              width={400}
              height={400}
              className="rounded-md object-cover w-full aspect-square"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          <div className="md:pt-24">
            <Image
              src="/CTA/2.jpg"
              alt="Custom embroidered clothing"
              width={400}
              height={400}
              className="rounded-md object-cover w-full aspect-square"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
          <div className="hidden md:block md:pt-48">
            <Image
              src="/CTA/3.jpg"
              alt="Custom embroidery detail"
              width={400}
              height={400}
              className="rounded-md object-cover w-full aspect-square"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        </div>
      </div>
    </Container>
  )
}
import Image from "next/image"
import { Button } from "~/components/ui/button"
import { Container } from "~/components/ui/container"

export function StitchingShowcase() {
  return (
    <Container>
      <div className="flex flex-col lg:flex-row items-center gap-8 py-8 md:py-16">
        {/* Images Grid */}
        <div className="relative w-full lg:w-[45%]">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/showcase/S1.jpg"
              alt="Stitching shop showcase"
              width={800}
              height={700}
              className="object-cover w-full aspect-[4/3.5]"
              priority
            />
          </div>
          <div className="absolute bottom-[-8%] right-[-4%] w-2/5 overflow-hidden rounded-lg shadow-xl">
            <div className="shadow-[0_16px_40px_rgba(8,_112,_184,_0.7)]">
              <Image
                src="/showcase/S2.jpeg"
                alt="Embroidery machine"
                width={400}
                height={300}
                className="object-cover w-full"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 w-full lg:w-[55%] lg:pl-24">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            You&apos;ve got the <span className="relative inline-block ml-4">
              ideas
              <Image
                src="/Circle.svg"
                alt="Decorative circle"
                width={294}
                height={194}
                className="absolute -top-4 md:-top-4 lg:-top-4 left-2 w-[400%] h-auto scale-150 translate-y-2 md:translate-y-0"
              />
            </span>,
            <br />
            <span className="underline decoration-[#74CADC]">we&apos;ve got the tools</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-[1.75]">
            We empower your creativity with our top-notch stitching and embroidery services. 
            Whether you dream of intricate designs, personalized monograms, or unique patterns, 
            our skilled artisans are ready to bring your visions to life.
          </p>
          <div className="pt-4">
            <Button size="lg" className="w-full sm:w-auto bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
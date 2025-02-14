import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-16">
      <Container>
        <div 
          className="relative rounded-2xl overflow-hidden h-[544px] md:h-[640px]"
          style={{
            backgroundImage: "url('/stitch.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          {/* Gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
          
          {/* Content */}
          <div className="relative h-full flex md:justify-end items-center p-8 md:p-16">
            {/* Mobile view - centered content */}
            <div className="md:hidden w-full">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 mx-auto max-w-[95%] border border-white/20">
                <div className="inline-flex items-center gap-2 mb-4 bg-[#74CADC]/20 text-[#0A5565] px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium text-sm">415 13th St, Moline IL</span>
                </div>

                <h1 className="text-2xl font-bold mb-4 text-foreground">
                  Bring Your Ideas to Life at <span className="italic">stitch please</span>
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Custom embroidery and personalized designs crafted with care.
                </p>

                <div className="flex flex-col gap-4">
                  <Button 
                    size="lg"
                    className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] font-medium"
                  >
                    Get Directions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full border-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/10"
                  >
                    Start Creating
                  </Button>
                </div>
              </div>
            </div>

            {/* Desktop view */}
            <div className="hidden md:block bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-[544px] border border-white/20">
              <div className="inline-flex items-center gap-2 mb-8 bg-[#74CADC]/20 text-[#0A5565] px-4 py-2 rounded-full">
                <MapPin className="h-5 w-5" />
                <span className="font-medium">415 13th St, Moline IL</span>
              </div>
              
              <h1 className="text-4xl font-bold mb-8 text-foreground leading-tight">
                Bring Your Ideas to Life at <span className="italic">stitch please</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Custom embroidery and personalized designs crafted with care. Transform your vision into wearable art.
              </p>

              <div className="flex gap-4">
                <Button 
                  size="lg"
                  className="flex-1 bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] font-medium"
                >
                  Get Directions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="flex-1 border-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/10"
                >
                  Start Creating
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
"use client";

import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative pt-16">
      <Container>
        <div className="relative rounded-3xl overflow-hidden h-[544px] md:h-[640px]">
          {/* Hero Image with Next.js Image optimization */}
          <Image
            src="/stitch.jpg"
            alt="Stitch Please storefront"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
            quality={90}
          />

          {/* Gradient overlay with improved contrast */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" 
          />
          
          {/* Content */}
          <div className="relative h-full flex items-center p-4 sm:p-8 md:p-16">
            {/* Content Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20, x: 0 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 w-full md:w-auto md:max-w-[544px] shadow-xl ring-1 ring-black/5 mx-auto md:mx-0 md:ml-auto"
            >
              {/* Location Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center mb-6 md:mb-8"
              >
                <div className="bg-[#74CADC]/20 text-[#0A5565] px-4 sm:px-6 py-2 rounded-full text-center">
                  <span className="text-sm sm:text-base font-medium">415 13th St, Moline IL</span>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl sm:text-2xl md:text-4xl leading-[1.2] md:leading-tight font-bold text-zinc-900 mb-4 sm:mb-6 md:mb-8 text-center"
              >
                Bring Your Ideas to Life at Stitch Please
              </motion.h1>

              {/* Description */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base sm:text-lg md:text-xl text-zinc-600 mb-6 sm:mb-8 md:mb-12 text-center"
              >
                Custom embroidery and personalized designs crafted with care. Transform your vision into wearable art.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
              >
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl font-medium"
                  onClick={() => window.open("https://maps.google.com/?q=415+13th+St,+Moline+IL", "_blank")}
                >
                  Get Directions
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-[#0A5565] hover:bg-[#74CADC]/10 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl font-medium border-zinc-200"
                >
                  Start Creating
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
"use client";

import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Dancing_Script } from 'next/font/google';

const dancingScript = Dancing_Script({ subsets: ['latin'] });

const letterAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + (i * 0.1),
      duration: 0.4
    }
  })
};

export function Hero() {
  const brandText = "stitch please".split("");

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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" 
          />
          
          {/* Content */}
          <div className="relative h-full flex md:justify-end items-center p-8 md:p-16">
            {/* Mobile view - centered content */}
            <div className="md:hidden w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/95 backdrop-blur-md rounded-2xl p-8 mx-auto max-w-[95%] border border-white/20"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex justify-center items-center gap-2 mb-4 bg-[#74CADC]/20 text-[#0A5565] px-4 py-2 rounded-full mx-auto w-fit"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="font-bold text-sm">415 13th St, Moline IL</span>
                </motion.div>

                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="text-2xl font-bold mb-4 text-foreground text-center"
                >
                  Bring Your Ideas to Life at{" "}
                  <span className={`${dancingScript.className} text-[#74CADC] text-3xl inline-flex`}>
                    {brandText.map((letter, i) => (
                      <motion.span
                        key={i}
                        custom={i}
                        variants={letterAnimation}
                        initial="initial"
                        animate="animate"
                        className="inline-block"
                      >
                        {letter === " " ? "\u00A0" : letter}
                      </motion.span>
                    ))}
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="text-lg text-muted-foreground mb-8 text-center"
                >
                  Custom embroidery and personalized designs crafted with care.
                </motion.p>

                <div className="flex flex-col gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <Button 
                      size="lg"
                      className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] font-medium"
                    >
                      Get Directions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full border-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/10"
                    >
                      Start Creating
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Desktop view */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:block bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-[544px] border border-white/20"
            >
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex justify-center items-center gap-2 mb-8 bg-[#74CADC]/20 text-[#0A5565] px-4 py-2 rounded-full mx-auto w-fit"
              >
                <MapPin className="h-5 w-5" />
                <span className="font-medium">415 13th St, Moline IL</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-4xl font-bold mb-8 text-foreground leading-tight text-center"
              >
                Bring Your Ideas to Life at{" "}
                <span className={`${dancingScript.className} text-[#74CADC] text-6xl inline-flex`}>
                  {brandText.map((letter, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterAnimation}
                      initial="initial"
                      animate="animate"
                      className="inline-block"
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-xl text-muted-foreground mb-8 text-center"
              >
                Custom embroidery and personalized designs crafted with care. Transform your vision into wearable art.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex justify-center gap-4"
              >
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
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
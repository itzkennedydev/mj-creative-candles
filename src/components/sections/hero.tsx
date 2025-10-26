"use client";

import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center min-h-[32rem]">
          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1 space-y-8"
          >
{/* Main Heading */}
<h1 className="text-4xl md:text-5xl font-bold text-[#1d1d1f] leading-tight">
  {/* Mobile - Single line for "Bring Your Ideas to Life at Stitch Please" */}
  <span className="md:hidden">
    Bring Your <span className="text-[#0A5565]">Ideas</span> to Life at <span className="text-[#0A5565] bg-[#74CADC]/40 px-2">Stitch Please</span>
  </span>
  
  {/* Desktop version with two lines */}
  <span className="hidden md:block">
    <span className="block">Bring Your <span className="text-[#0A5565]">Ideas</span> to Life</span>
    <span className="block mt-2">
      at
      <span className="relative inline-block ml-4">
        <span className="relative text-[#0A5565] z-10 px-2">Stitch Please</span>
        <span className="absolute inset-0 -left-2 -right-2 bg-[#74CADC]/40 z-0"></span>
      </span>
    </span>
  </span>
</h1>
            
            {/* Description */}
            <p className="text-lg text-[#1d1d1f]/70 max-w-lg">
              Custom embroidery and personalized designs crafted with care. Transform your vision into wearable art that tells your unique story.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-base px-6 py-3 h-auto rounded-xl font-medium shadow-lg shadow-[#74CADC]/20"
                onClick={() => router.push('/shop')}
              >
                Shop
              </Button>
              <Button 
                variant="ghost"
                className="bg-gray-100 hover:bg-gray-200 text-[#0A5565] text-base px-6 py-3 h-auto rounded-xl font-medium"
                onClick={() => window.open("https://maps.google.com/?q=415+13th+St,+Moline+IL+61265", "_blank")}
              >
                Get Directions
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="pt-4">
              <p className="text-sm text-[#1d1d1f]/50 mb-4">Trusted by local businesses and individuals</p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#74CADC]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#74CADC]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#74CADC]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#74CADC]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#74CADC]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-2 text-[#1d1d1f]/80 font-medium">4.9/5</span>
                </div>
                <div className="text-[#1d1d1f]/80 font-medium">500+ Happy Customers</div>
              </div>
            </div>
          </motion.div>
          
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
            whileHover={{ scale: 1.03 }}
          >
            <div className="relative h-[24rem] md:h-[32rem] rounded-2xl overflow-hidden shadow-2xl rotate-1 transition-all duration-300 hover:shadow-xl hover:rotate-0">
              <Image
                src="/Van.jpg"
                alt="Stitch Please storefront"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 640px"
                quality={90}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1d1d1f]/30 via-transparent to-transparent" />
              
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-gray-200/30 rounded-full blur-2xl"></div>
              <div className="absolute -top-4 -left-4 h-24 w-24 bg-gray-50 rounded-full blur-xl"></div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
"use client"

import Image from "next/image"
import { Container } from "~/components/ui/container"
import { Button } from "~/components/ui/button"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export function WhyChoose() {
  const router = useRouter();

  return (
    <section className="relative bg-[#F7F7F7] overflow-hidden">
      <Container>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col justify-center items-center py-8 sm:py-16 md:py-24"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4 bg-[#74CADC]/20 text-[#0A5565] px-4 py-2 rounded-full"
          >
            <span className="font-bold text-xs sm:text-sm">Our commitment to quality</span>
          </motion.div>

          {/* Heading */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 px-8 leading-tight"
          >
            Why choose
            <span className="block mt-1">
              Stitch Please?
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-[#1d1d1f]/60 text-center max-w-[95%] sm:max-w-xl md:max-w-2xl mx-auto text-base md:text-lg mb-8 px-4 leading-[1.75]"
          >
            Our personalized collaboration, swift turnaround, and commitment to impeccable craftsmanship make us the ideal choice for those who seek excellence in every stitch.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                scale: [1, 1.02, 1],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              <Button 
                size="lg"
                className="bg-[#0A5565] hover:bg-[#083d4a] text-white font-semibold text-sm sm:text-base transition-colors duration-200 rounded-xl px-6"
                onClick={() => router.push('/shop')}
              >
                <motion.span
                  className="flex items-center"
                  whileHover={{
                    x: [0, 4, 0],
                    transition: {
                      duration: 0.6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  Shop
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Decorative Images */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Left Side Images */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden sm:block absolute -left-16 -top-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <Image
                src="/why/W1.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto rotate-6"
              />
            </motion.div>
          </motion.div>

          {/* Left Side Images continued */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="hidden sm:block absolute left-48 top-1/4"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            >
              <Image
                src="/why/W2.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto -rotate-12"
              />
            </motion.div>
          </motion.div>

          {/* Left side continued */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="hidden sm:block absolute left-24 -bottom-8"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
            >
              <Image
                src="/why/W3.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto rotate-3"
              />
            </motion.div>
          </motion.div>

          {/* Right Side Images */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden sm:block absolute -right-8 top-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }}
            >
              <Image
                src="/why/W4.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto -rotate-8"
              />
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="hidden sm:block absolute right-24 top-2/3"
          >
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 5.8, ease: "easeInOut" }}
            >
              <Image
                src="/why/W5.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto rotate-12"
              />
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="hidden sm:block absolute right-64 -top-16"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6.2, ease: "easeInOut" }}
            >
              <Image
                src="/why/W6.png"
                alt="Stitching example"
                width={200}
                height={200}
                className="rounded-lg shadow-lg w-[128px] sm:w-[160px] md:w-[200px] h-auto -rotate-6"
              />
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
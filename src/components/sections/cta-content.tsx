'use client'

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "~/components/ui/button"

export function CtaContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 md:py-24">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
          Speed and Precision <br className="hidden sm:block" />
          in Every Seam
        </h2>
        <motion.p 
          className="text-muted-foreground text-base md:text-lg max-w-xl leading-[1.75]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          At Stitch Please, we redefine the standard for fast and quality service. 
          Our commitment to speed doesn&apos;t compromise the impeccable craftsmanship that sets us apart.
        </motion.p>
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            size="lg" 
            className="w-full sm:w-auto bg-[#74CADC] text-[#0A5565] hover:bg-[#74CADC]/90"
            onClick={() => window.open("https://stores.inksoft.com/StitchPlease_Custom_Embroidery/shop/design-studio/select-product", "_blank")}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
        <motion.div 
          className="md:col-span-1"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/CTA/1.jpg"
            alt="Embroidered sports wear" 
            width={400}
            height={400}
            className="rounded-md object-cover w-full aspect-square"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </motion.div>
        <motion.div 
          className="md:pt-24"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="/CTA/2.jpg"
            alt="Custom embroidered clothing"
            width={400}
            height={400}
            className="rounded-md object-cover w-full aspect-square"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </motion.div>
        <motion.div 
          className="hidden md:block md:pt-48"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Image
            src="/CTA/3.jpg"
            alt="Custom embroidery detail"
            width={400}
            height={400}
            className="rounded-md object-cover w-full aspect-square"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </motion.div>
      </div>
    </div>
  )
} 
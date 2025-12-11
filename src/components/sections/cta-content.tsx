"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { IMAGE_URLS } from "~/lib/image-config";

export function CtaContent() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 items-center gap-8 py-8 md:py-24 lg:grid-cols-2">
      <motion.div
        className="space-y-6 text-center lg:text-left"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl lg:text-5xl">
          Quality and Care <br className="sm:hidden" />
          in Every Candle <br className="hidden sm:block" />
        </h2>
        <motion.p
          className="max-w-xl text-base leading-[1.75] text-muted-foreground md:text-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          At MJ Creative Candles, we redefine the standard for handcrafted
          quality and personalized service. Our commitment to excellence
          doesn&apos;t compromise the impeccable craftsmanship that sets us
          apart.
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
            className="w-full rounded-xl bg-[#1d1d1f] px-8 font-semibold text-white hover:bg-[#0a0a0a] sm:w-auto"
            onClick={() => router.push("/shop")}
          >
            Get Started
          </Button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={IMAGE_URLS.cta.image1}
            alt="Handcrafted candle"
            width={400}
            height={400}
            className="aspect-square w-full rounded-md object-cover"
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
            src={IMAGE_URLS.cta.image2}
            alt="Custom scented candles"
            width={400}
            height={400}
            className="aspect-square w-full rounded-md object-cover"
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
            src={IMAGE_URLS.cta.image3}
            alt="Custom candle detail"
            width={400}
            height={400}
            className="aspect-square w-full rounded-md object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </motion.div>
      </div>
    </div>
  );
}

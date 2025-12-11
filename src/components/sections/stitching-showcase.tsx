"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { useRouter } from "next/navigation";
import { IMAGE_URLS } from "~/lib/image-config";

const MotionImage = motion(Image);

export function StitchingShowcase() {
  const router = useRouter();

  return (
    <Container>
      <div className="flex flex-col items-center gap-8 py-8 md:py-16 lg:flex-row">
        {/* Images Grid */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mb-12 w-full lg:mb-0 lg:w-[45%]"
        >
          <div className="relative overflow-hidden rounded-lg">
            <MotionImage
              initial={{ scale: 1.2 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              src={IMAGE_URLS.showcase.image1}
              alt="Candle shop showcase"
              width={800}
              height={700}
              className="aspect-[4/3.5] w-full object-cover"
              priority
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-[-8%] right-0 w-2/5 overflow-hidden rounded-lg shadow-xl"
          >
            <div className="shadow-[0_16px_40px_rgba(8,_112,_184,_0.7)]">
              <Image
                src={IMAGE_URLS.showcase.image2}
                alt="Candle making process"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full space-y-4 text-center lg:w-[55%] lg:pl-24 lg:text-left"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl lg:text-5xl"
          >
            You&apos;ve got the{" "}
            <span className="relative ml-4 inline-block">
              ideas
              <Image
                src="/Circle.svg"
                alt="Decorative circle"
                width={294}
                height={194}
                className="absolute -top-4 left-2 h-auto w-[400%] translate-y-2 scale-150 md:-top-4 md:translate-y-0 lg:-top-4"
              />
            </span>
            ,
            <br />
            <span className="underline decoration-[#737373]">
              we&apos;ve got the tools
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-xl text-base leading-[1.75] text-muted-foreground md:text-lg"
          >
            We empower your creativity with our handcrafted candles. Whether you
            dream of custom scents, personalized labels, or unique designs, our
            skilled artisans are ready to bring your visions to life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-4"
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
      </div>
    </Container>
  );
}

"use client";

import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { ArrowRight, Mail, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const products = [
  "Hoodies, tshirts, jackets",
  "Baby apparel",
  "Hats and beanies",
  "Promotional items (koozies, masks and more!)",
  "Mugs",
  "Blankets",
  "Banners and yard signs",
  "Canvas bags, backpacks and sports bags customization",
  "Sports wear (embroidered and customized numbers)",
  "Headbands",
  "Towels",
  "Graduation caps",
  "Shoe customization",
  "Wedding party apparel and gifts",
  "Water bottles",
  "Pillows",
  "Curtains",
  "Robes",
  "Baby gifts",
  "Balloon stuffing"
];

const partners = [
  { name: "1st Gen Gold", image: "/1ST GEN GOLD LOGO.png" },
  { name: "UTHS Soccer", image: "/UTHS SOCCER (1).png" },
  { name: "APK", image: "/APK LOGO (1).png" },
  { name: "Speeding Movers", image: "/speeding movers red.png" },
  { name: "Heartland Havoc", image: "/Heartland Havoc Logo (1).jpg" },
  { name: "Midwest Motorsports QC", image: "/STORM 2.jpg" },
  { name: "Ready Logo", image: "/READY LOGO.jpg" },
  { name: "Ronzon's Tree Services", image: "/LOGO RONZON´S TREE SERVICES.png" }
];

export default function ServicesPage() {
  return (
    <Container>
      <div className="py-16 md:py-24 space-y-16 md:space-y-24">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <div className="inline-block bg-[#74CADC]/20 text-[#0A5565] px-6 py-2 rounded-full mb-4">
            <span className="text-sm font-medium">Our Services</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900">Where We Make Your Logo <br className="hidden md:block" />Come to Life</h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            We offer a wide range of customization services to bring your vision to life.
          </p>
        </motion.section>

        {/* Products Grid */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-semibold text-zinc-900">Our Products Include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-zinc-100 hover:border-[#74CADC]/30"
              >
                <p className="text-zinc-600">{product}</p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: products.length * 0.05 }}
              className="p-6 bg-[#74CADC]/10 rounded-xl shadow-sm hover:shadow-md transition-all border border-[#74CADC]/30"
            >
              <p className="text-[#0A5565] font-medium">...AND so much more!</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Mobile Services */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-50 p-12 rounded-2xl text-center space-y-6 border border-zinc-200"
        >
          <h2 className="text-3xl font-semibold text-zinc-900">Mobile Services Now Available!</h2>
          <p className="text-xl text-zinc-600">
            We are now bringing the personalization to you! 🪡
          </p>
          <div className="space-y-4">
            <p className="font-medium text-[#0A5565]">ASK ABOUT OUR MOBILE SERVICES!</p>
            <Button 
              size="lg"
              className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-lg"
            >
              Call or Text 309-373-6017
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>

        {/* Partners Showcase */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <h2 className="text-2xl font-semibold text-zinc-900 text-center">Some of our satisfied customers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, index) => (
              <motion.div 
                key={partner.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="aspect-square relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-zinc-100"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Newsletter Signup */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-zinc-50 p-12 rounded-2xl text-center space-y-8 border border-zinc-200"
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-semibold text-zinc-900">Stay Updated</h2>
            <p className="text-zinc-600">Sign up with your email address to receive news and updates.</p>
          </div>
          
          <form className="max-w-md mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-[#74CADC] focus:ring-[#74CADC] transition-colors"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-[#74CADC] focus:ring-[#74CADC] transition-colors"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-[#74CADC] focus:ring-[#74CADC] transition-colors md:col-span-2"
            />
            <Button 
              type="submit"
              size="lg"
              className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-lg md:col-span-2"
            >
              Sign Up
              <Mail className="ml-2 h-5 w-5" />
            </Button>
          </form>
          <p className="text-sm text-zinc-500">We respect your privacy.</p>
        </motion.section>

        {/* Social Media */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-2xl font-semibold text-zinc-900">Get Connected</h2>
          <p className="text-zinc-600">
            Follow us on social media @stitchpleaseqc
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="text-[#0A5565] hover:bg-[#74CADC]/10 border-zinc-200"
            >
              <Facebook className="mr-2 h-5 w-5" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-[#0A5565] hover:bg-[#74CADC]/10 border-zinc-200"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Instagram
            </Button>
          </div>
        </motion.section>
      </div>
    </Container>
  );
} 
"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Facebook, Instagram, Phone } from "lucide-react";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";

const productCategories = [
  {
    name: "Apparel",
    icon: "👕",
    items: [
      "Hoodies, tshirts, jackets",
      "Baby apparel", 
      "Sports wear (embroidered and customized numbers)",
      "Wedding party apparel and gifts",
      "Robes"
    ]
  },
  {
    name: "Headwear & Accessories",
    icon: "🧢",
    items: [
      "Hats and beanies",
      "Headbands",
      "Shoe customization",
      "Canvas bags, backpacks",
      "Sports bags customization"
    ]
  },
  {
    name: "Home & Decor",
    icon: "🏠",
    items: [
      "Blankets",
      "Pillows",
      "Curtains",
      "Towels",
      "Mugs"
    ]
  },
  {
    name: "Special Events",
    icon: "🎉",
    items: [
      "Graduation caps",
      "Wedding party gifts",
      "Baby gifts",
      "Balloon stuffing",
      "Banners and yard signs"
    ]
  },
  {
    name: "Promotional",
    icon: "🎯",
    items: [
      "Koozies",
      "Masks",
      "Water bottles",
      "Promotional items",
      "Custom merchandise"
    ]
  }
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
      <div className="py-16 space-y-16">
        {/* Products & Services */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-2">Our Products & Services</h2>
            <p className="text-[#1d1d1f]/60">
              From apparel to promotional items, we offer a wide range of customization options to bring your vision to life.
            </p>
          </div>

          <Tabs defaultValue="Apparel" className="space-y-8">
            <TabsList className="flex flex-wrap justify-center gap-3 bg-transparent">
              {productCategories.map((category) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  className="data-[state=active]:bg-[#0A5565] data-[state=active]:text-white border border-zinc-200 hover:border-[#0A5565] px-4 py-2 rounded-xl"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {productCategories.map((category) => (
              <TabsContent key={category.name} value={category.name}>
                <div className="p-8 rounded-2xl bg-[#f7f7f7]">
                  <div className="flex items-center text-[#0A5565] mb-6">
                    <h3 className="text-2xl font-semibold">{category.name}</h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white hover:bg-white/80 transition-colors group cursor-pointer border border-zinc-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#0A5565]/10 flex items-center justify-center">
                            <span className="text-[#0A5565] text-sm font-medium">{i + 1}</span>
                          </div>
                          <span className="text-[#1d1d1f]/80 font-medium">{item}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="p-8 rounded-2xl bg-[#f7f7f7] text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Don&apos;t see what you&apos;re looking for?</h3>
                <p className="text-[#1d1d1f]/60">
                  We can customize almost anything! Our mobile services bring the personalization to you.
                </p>
              </div>
              <Button 
                size="lg"
                className="bg-[#0A5565] hover:bg-[#0A5565]/90 text-white"
                onClick={() => window.open("tel:3093736017", "_blank")}
              >
                <Phone className="mr-2 h-5 w-5" />
                Call or Text (309) 373-6017
              </Button>
            </div>
          </div>
        </section>

        {/* Partners Showcase */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-[#1d1d1f] text-center">Trusted By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="p-6 rounded-2xl bg-[#f7f7f7] group hover:bg-white transition-all"
              >
                <div className="relative aspect-square">
                  <Image
                    src={partner.image}
                    alt={partner.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter & Social */}
        <div className="p-12 rounded-2xl bg-[#f7f7f7]">
          <div className="max-w-xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#1d1d1f] mb-2">Stay Connected</h3>
              <p className="text-[#1d1d1f]/60">Get the latest updates and join our community.</p>
            </div>
            
            <div className="space-y-6">
              <form className="flex gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-[#0A5565] hover:bg-[#0A5565]/90 text-white whitespace-nowrap"
                >
                  Subscribe
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-[#0A5565] hover:bg-white border-zinc-200"
                  onClick={() => window.open("https://www.facebook.com/stitchpleaseqc", "_blank")}
                >
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-[#0A5565] hover:bg-white border-zinc-200"
                  onClick={() => window.open("https://www.instagram.com/stitchpleaseqc", "_blank")}
                >
                  <Instagram className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
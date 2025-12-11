"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { Phone, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { NewsletterSection } from "~/components/sections/newsletter";

const productCategories = [
  {
    name: "Apparel",
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
  const [activeCategory, setActiveCategory] = useState("Apparel");
  const [hoveredPartner, setHoveredPartner] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-white pt-[53px] pb-[80px] lg:pb-0 lg:pt-[60px]">
      {/* Hero Section - NEO Style */}
      <section className="py-[40px] lg:py-[60px]">
        <Container>
          <div className="text-center">
          <h1 className="text-[32px] lg:text-[48px] leading-[130%] font-bold text-black/[0.72]">
            Our Services
          </h1>
          <p className="text-[16px] lg:text-[20px] leading-[130%] text-black/[0.44] mt-[8px] max-w-[600px] mx-auto">
            From apparel to promotional items, we bring your vision to life with precision and care
          </p>
        </div>
      </Container>
      </section>

      {/* Products & Services Grid - NEO Style */}
      <section className="pb-[60px]">
        <Container>
          {/* Category Tabs - NEO Style */}
          <div className="flex flex-wrap gap-[8px] justify-center mb-[40px]">
            {productCategories.map((category) => (
              <Button
                key={category.name}
                onClick={() => setActiveCategory(category.name)}
                className={`px-[22px] py-[11px] text-[14px] border-[2px] leading-[130%] rounded-full ${
                  activeCategory === category.name
                    ? 'bg-[#1d1d1f] hover:bg-[#0a0a0a] text-white border-[#1d1d1f]'
                    : 'border-black/[0.06] hover:border-black/[0.12] text-black/[0.72] bg-transparent'
                }`}
                variant={activeCategory === category.name ? 'default' : 'outline'}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Active Category Content */}
          <div className="bg-black/[0.03] rounded-[40px] p-[32px] lg:p-[48px]">
            <div className="flex items-center justify-center mb-[32px]">
              <h2 className="text-[24px] lg:text-[32px] leading-[130%] font-bold text-black/[0.72]">
                {activeCategory}
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              {productCategories
                .find(c => c.name === activeCategory)
                ?.items.map((item, i) => (
                  <div
                    key={i}
                    className="group p-[24px] bg-white hover:bg-black/[0.06] rounded-[24px] transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start gap-[16px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[#737373]/20 group-hover:bg-[#737373] flex items-center justify-center flex-shrink-0 transition-all duration-300">
                        <span className="text-[14px] font-bold text-black/[0.72] group-hover:text-white">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-[14px] leading-[130%] text-black/[0.72] font-medium">
                        {item}
                      </span>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* CTA Section - NEO Style */}
          <div className="mt-[40px] p-[32px] lg:p-[48px] bg-gradient-to-br from-[#737373]/10 to-[#737373]/5 rounded-[40px] text-center">
            <h3 className="text-[20px] lg:text-[24px] leading-[130%] font-bold text-black/[0.72] mb-[8px]">
              Don&apos;t see what you&apos;re looking for?
            </h3>
            <p className="text-[14px] lg:text-[16px] leading-[130%] text-black/[0.44] mb-[24px] max-w-[500px] mx-auto">
              We can customize almost anything! Our mobile services bring the personalization to you.
            </p>
            <Button
              onClick={() => window.open("tel:3093736017", "_blank")}
              className="inline-flex items-center px-6 py-4 bg-[#1d1d1f] hover:bg-[#0a0a0a] text-white font-semibold rounded-xl group"
            >
              <Phone className="mr-[8px] h-[16px] w-[16px] group-hover:scale-110 transition-transform" />
              <span className="text-[14px] leading-[130%] font-medium">Call or Text (309) 373-6017</span>
              <ChevronRight className="ml-[8px] h-[16px] w-[16px] group-hover:translate-x-[4px] transition-transform" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Partners Section - NEO Style */}
      <section className="py-[60px] bg-[#F7F7F7]/50">
        <Container>
          <div className="text-center mb-[40px]">
            <h2 className="text-[24px] lg:text-[32px] leading-[130%] font-bold text-black/[0.72]">
              Trusted By
            </h2>
            <p className="text-[14px] lg:text-[16px] leading-[130%] text-black/[0.44] mt-[8px]">
              Leading brands and organizations choose us for their custom needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[16px] lg:gap-[24px]">
            {partners.map((partner, index) => (
              <div
                key={partner.name}
                onMouseEnter={() => setHoveredPartner(index)}
                onMouseLeave={() => setHoveredPartner(null)}
                className="relative group"
              >
                <div className="aspect-square p-[24px] lg:p-[32px] bg-white rounded-[24px] flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <div className="relative w-full h-full">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-contain transition-all duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </div>
                {/* Partner name on hover */}
                <div className={`absolute -bottom-[32px] left-0 right-0 text-center transition-all duration-300 ${
                  hoveredPartner === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <span className="text-[12px] leading-[130%] text-black/[0.44] font-medium">
                    {partner.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter Section - NEO Style */}
      <NewsletterSection showPhone={true} />
    </main>
  );
}
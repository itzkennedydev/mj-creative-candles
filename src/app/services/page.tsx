"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Facebook, Instagram, Phone, Search } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-[#f7f7f7] p-8 md:p-16">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-[#1d1d1f]">
              Where We Make Your Logo Come to Life
            </h1>
            <p className="text-xl text-[#1d1d1f]/60">
              We offer a wide range of customization services to bring your vision to life.
            </p>
          </div>
        </section>

        {/* Products & Services */}
        <section className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-[#1d1d1f]">Our Products & Services</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1d1d1f]/40 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2 rounded-full border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] w-64"
              />
            </div>
          </div>

          <Tabs defaultValue="Apparel" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-transparent">
              {productCategories.map((category) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  className="data-[state=active]:bg-[#f7f7f7] data-[state=active]:text-[#0A5565] border border-zinc-200 hover:border-[#0A5565]"
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {productCategories.map((category) => (
              <TabsContent key={category.name} value={category.name}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#0A5565]">
                      <span className="text-2xl mr-2">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      Explore our {category.name.toLowerCase()} customization options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((item, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg bg-[#f7f7f7] hover:bg-[#f7f7f7] transition-colors group cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-2 h-2 bg-[#0A5565] rounded-full group-hover:scale-125 transition-transform" />
                            <span className="text-[#1d1d1f]/70">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Card className="bg-[#f7f7f7] border-zinc-200">
            <CardContent className="p-6">
              <p className="text-[#0A5565] font-medium text-lg text-center">
                Don&apos;t see what you&apos;re looking for? Contact us! We can customize almost anything!
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Mobile Services */}
        <Card className="bg-[#f7f7f7]">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-semibold text-[#1d1d1f]">Mobile Services Now Available!</h2>
            <p className="text-xl text-[#1d1d1f]/60">
              We are now bringing the personalization to you! 🪡
            </p>
            <div className="space-y-4">
              <p className="font-medium text-[#0A5565]">ASK ABOUT OUR MOBILE SERVICES!</p>
              <Button 
                size="lg"
                className="bg-[#0A5565] hover:bg-[#0A5565]/90 text-white text-lg"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call or Text 309-373-6017
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Partners Showcase */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] text-center">Trusted By</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner) => (
              <Card
                key={partner.name}
                className="group hover:shadow-lg transition-all overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="relative aspect-square">
                    <Image
                      src={partner.image}
                      alt={partner.name}
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter & Social */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-[#f7f7f7]">
            <CardContent className="p-8 space-y-6">
              <CardTitle className="text-2xl">Stay Updated</CardTitle>
              <CardDescription>
                Sign up to receive news and updates about our latest services and promotions.
              </CardDescription>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm"
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-[#0A5565] hover:bg-[#0A5565]/90 text-white text-lg"
                >
                  Sign Up
                  <Mail className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8 space-y-6">
              <CardTitle className="text-2xl">Get Connected</CardTitle>
              <CardDescription>
                Follow us on social media @stitchpleaseqc for the latest updates, behind-the-scenes content, and inspiration.
              </CardDescription>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-[#0A5565] hover:bg-[#f7f7f7] border-zinc-200"
                >
                  <Facebook className="mr-2 h-5 w-5" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-[#0A5565] hover:bg-[#f7f7f7] border-zinc-200"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  Instagram
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
"use client";

import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Camera, Bone, Gift, PawPrint, Sparkles, Facebook, Instagram, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";

export default function StitchSniffHolidayEvent() {

  const activities = [
    {
      icon: Camera,
      title: "Photo Booth",
      description: "Capture memories with your furry friend"
    },
    {
      icon: Bone,
      title: "Dog Snacks",
      description: "Special treats for our four-legged guests"
    },
    {
      icon: Gift,
      title: "Dog Stockings",
      description: "Holiday stockings for your pup"
    },
    {
      icon: PawPrint,
      title: "Xmas Outfits",
      description: "Festive attire for the holidays"
    },
    {
      icon: Sparkles,
      title: "Paw Print Ornaments",
      description: "Create a keepsake ornament"
    },
    {
      icon: Gift,
      title: "Custom Accessories",
      description: "Personalize leashes and collars"
    }
  ];

  return (
    <main className="min-h-screen bg-white pt-[20px] pb-[80px] lg:pb-0 lg:pt-[30px]">
      {/* Hero Section - NEO Style */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#74CADC]/5 via-transparent to-[#74CADC]/10" />
        <div className="relative py-[40px] lg:py-[80px]">
          <Container>
            <div className="text-center">
              <div className="flex flex-col items-center">
              <h1 className="text-[40px] lg:text-[64px] leading-[100%] font-bold text-black/[0.72]">
                STITCH & SNIFF
              </h1>
              <span className="text-[24px] lg:text-[32px] leading-[130%] text-black/[0.44] mt-[8px]">
                Holiday Event
              </span>
              <div className="flex gap-[8px] mt-[16px]">
                <span className="px-[16px] py-[6px] bg-black/[0.06] rounded-full text-[12px] leading-[130%] text-black/[0.72] font-medium">
                  Dog Friendly
                </span>
                <span className="px-[16px] py-[6px] bg-[#74CADC]/20 rounded-full text-[12px] leading-[130%] text-black/[0.72] font-medium">
                  Free Entry
                </span>
              </div>
            </div>
          </div>
          </Container>
        </div>
      </section>

      {/* Main Content - NEO Style Grid */}
      <div className="py-[40px]">
        <Container>
          <div className="lg:grid lg:grid-cols-[1fr_480px] lg:gap-[40px]">
            {/* Left Column - Event Details */}
            <div className="space-y-[24px]">
              {/* Date & Time Card - NEO Style */}
              <div className="bg-black/[0.03] rounded-[24px] p-[32px]">
                <div className="flex justify-between items-start lg:items-center flex-col lg:flex-row gap-[24px]">
                  <div>
                    <div className="flex items-center gap-[12px] mb-[16px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center">
                        <Calendar className="h-[20px] w-[20px] text-black/[0.72]" />
                      </div>
                      <div>
                        <h3 className="text-[20px] leading-[130%] font-bold text-black/[0.72]">
                          Saturday, December 6th
                        </h3>
                        <p className="text-[14px] leading-[130%] text-black/[0.44]">
                          11:00 AM – 4:00 PM
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center">
                        <MapPin className="h-[20px] w-[20px] text-black/[0.72]" />
                      </div>
                      <div>
                        <p className="text-[16px] leading-[130%] font-medium text-black/[0.72]">
                          415 13th St.
                        </p>
                        <p className="text-[14px] leading-[130%] text-black/[0.44]">
                          Moline, IL 61265
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => window.open("https://maps.google.com/?q=415+13th+St,+Moline+IL+61265", "_blank")}
                  className="mt-[24px] w-full lg:w-auto px-[24px] py-[14px] bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-[14px] leading-[130%] transition-all duration-[0.25s] flex items-center justify-center gap-[8px] group"
                >
                  <span className="font-medium">Get Directions</span>
                  <ArrowRight className="h-[16px] w-[16px] group-hover:translate-x-[4px] transition-transform" />
                </Button>
              </div>

              {/* Activities Grid - NEO Style */}
              <div>
                <h3 className="text-[20px] leading-[130%] font-bold text-black/[0.72] mb-[24px] text-center lg:text-left">
                  Event Activities
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-[16px]">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="group p-[24px] bg-black/[0.03] hover:bg-black/[0.06] rounded-[20px] transition-all duration-[0.25s] cursor-pointer"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-[48px] h-[48px] rounded-full bg-white flex items-center justify-center mb-[12px] group-hover:bg-[#74CADC] transition-all duration-[0.25s]">
                            <Icon className="h-[24px] w-[24px] text-black/[0.72] group-hover:text-white transition-colors" />
                          </div>
                          <h4 className="text-[14px] leading-[130%] font-bold mb-[8px] text-black/[0.72]">
                            {activity.title}
                          </h4>
                          <p className="text-[12px] leading-[130%] text-black/[0.44]">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Info Banner - NEO Style */}
              <div className="bg-gradient-to-r from-[#74CADC]/10 to-[#74CADC]/5 rounded-[24px] p-[32px] text-center">
                <h3 className="text-[18px] leading-[130%] font-bold text-black/[0.72] mb-[16px]">
                  Join Us for Festive Fun!
                </h3>
                <div className="flex flex-wrap justify-center gap-[8px] mb-[24px]">
                  {['Door Prizes', 'Holiday Music', 'Photo Ops', 'Treats'].map((item) => (
                    <span 
                      key={item}
                      className="px-[16px] py-[8px] bg-white/80 backdrop-blur-sm rounded-full text-[14px] leading-[130%] text-black/[0.72] font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                
                {/* Social Links - NEO Style */}
                <p className="text-[14px] leading-[130%] text-black/[0.44] mb-[16px]">
                  Follow us for sneak peeks and updates
                </p>
                <div className="flex justify-center gap-[16px]">
                  <Button
                    onClick={() => window.open("https://facebook.com/stitchpleaseqc", "_blank")}
                    className="w-[48px] h-[48px] rounded-full bg-black/[0.03] hover:bg-[#74CADC] flex items-center justify-center transition-all duration-[0.25s] group"
                    variant="ghost"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-[#0A5565] transition-colors" />
                  </Button>
                  <Button
                    onClick={() => window.open("https://instagram.com/stitchpleaseqc", "_blank")}
                    className="w-[48px] h-[48px] rounded-full bg-black/[0.03] hover:bg-[#74CADC] flex items-center justify-center transition-all duration-[0.25s] group"
                    variant="ghost"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-[#0A5565] transition-colors" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Image - NEO Style */}
            <div className="mt-[40px] lg:mt-0">
              <div className="sticky top-[80px]">
                <div className="relative rounded-[40px] overflow-hidden bg-[#F1F1EF] shadow-2xl">
                  <div className="aspect-[3/4] lg:aspect-[4/5] relative">
                    <Image
                      src="/IMG_9615.jpg"
                      alt="Stitch & Sniff Holiday Event - Woman with Golden Retriever"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 480px"
                      priority
                    />
                    {/* Overlay gradient for better text visibility if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                    
                    {/* Event badge on image */}
                    <div className="absolute top-[24px] left-[24px] right-[24px]">
                      <div className="bg-white/95 backdrop-blur-sm rounded-[20px] p-[16px] shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[12px] leading-[130%] text-black/[0.44] font-medium">
                              Hosted by
                            </p>
                            <p className="text-[14px] leading-[130%] text-black/[0.72] font-bold">
                              Stitch Please Custom
                            </p>
                          </div>
                          <div className="w-[40px] h-[40px] rounded-full bg-[#74CADC]/20 flex items-center justify-center">
                            <PawPrint className="h-[20px] w-[20px] text-[#74CADC]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
}
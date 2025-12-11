"use client";

import React from 'react';
import Image from "next/image";
import { ArrowRight, Star, Award, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { NewsletterSection } from "~/components/sections/newsletter";

const testimonials = [
  {
    quote: "Stitch, Please embroidered T-shirts and Polos for my church's 101st Anniversary. The owner 'Tanika' did an outstanding job, she went above and beyond to make sure I (Mt. Zion) was satisfied!",
    author: "Ivey",
    rating: 5
  },
  {
    quote: "We walked in, we told her what we needed. We came back an hour and half later and the item was ready to go. It is perfect, exactly what I wanted. Very, very friendly!",
    author: "Jonna",
    rating: 5
  },
  {
    quote: "She is just Amazing! Able to accommodate whatever your need may be and in an Awesome time frame! I gave her a last minute order and she not only completed it, but Exceeded expectations!",
    author: "Beth",
    rating: 5
  },
  {
    quote: "Very creative and fast turn around time. Awesome that vinyl and embroidery are both offered!",
    author: "Jamie",
    rating: 5
  }
];

const stats = [
  { icon: Award, value: "10+", label: "Years Experience" },
  { icon: Users, value: "500+", label: "Happy Customers" },
  { icon: Clock, value: "24hr", label: "Quick Turnaround" },
  { icon: Star, value: "5.0", label: "Average Rating" }
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-white pt-[20px] pb-[80px] lg:pb-0 lg:pt-[30px]">
      {/* Hero Section - NEO Style */}
      <section className="py-[40px] lg:py-[80px]">
        <Container>
          <div className="lg:grid lg:grid-cols-2 lg:gap-[60px] items-center">
            {/* Left - Image */}
            <div className="mb-[40px] lg:mb-0">
              <div className="relative rounded-[40px] overflow-hidden bg-[#F1F1EF] group">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="/stitch.jpg"
                    alt="MJ Creative Candles Studio"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="lg:pl-[40px]">
              <div className="mb-[32px]">
                <h1 className="text-[32px] lg:text-[48px] leading-[130%] font-bold text-black/[0.72]">
                  Our Story
                </h1>
                <p className="text-[16px] lg:text-[18px] leading-[150%] text-black/[0.44] mt-[16px]">
                  From a home studio to the Quad Cities&apos; premier destination for custom embroidery and personalization services, our founder Tanika Zentic leads a passionate team dedicated to bringing your ideas to life.
                </p>
              </div>

              {/* Stats Grid - NEO Style */}
              <div className="grid grid-cols-2 gap-[16px] mb-[32px]">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="p-[20px] bg-black/[0.03] rounded-[20px] hover:bg-black/[0.06] transition-all duration-300 cursor-pointer group"
                    >
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center group-hover:bg-[#74CADC] transition-all duration-300">
                          <Icon className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <p className="text-[20px] leading-[130%] font-bold text-black/[0.72]">
                            {stat.value}
                          </p>
                          <p className="text-[12px] leading-[130%] text-black/[0.44]">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA Button - NEO Style */}
              <Button
                onClick={() => router.push('/shop')}
                className="w-full lg:w-auto px-8 py-4 bg-[#0A5565] hover:bg-[#083d4a] text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span className="text-[16px] leading-[130%] font-medium">Start Your Project</span>
                <ArrowRight className="h-[20px] w-[20px] group-hover:translate-x-[4px] transition-transform" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section - NEO Style */}
      <section className="py-[60px] bg-[#F7F7F7]/50">
        <Container>
          <div className="text-center mb-[40px]">
            <h2 className="text-[24px] lg:text-[32px] leading-[130%] font-bold text-black/[0.72]">
              Our Commitment
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-[24px]">
            <div className="p-[32px] bg-white rounded-[24px] hover:shadow-lg transition-all duration-300">
              <h3 className="text-[20px] leading-[130%] font-bold text-black/[0.72] mb-[16px]">
                Experience & Expertise
              </h3>
              <p className="text-[14px] leading-[150%] text-black/[0.44]">
                With over a decade of experience in custom embroidery and personalization, Tanika has built a reputation for excellence and innovation in the Quad Cities area. Her expertise spans from intricate monogramming to large-scale commercial projects.
              </p>
            </div>

            <div className="p-[32px] bg-white rounded-[24px] hover:shadow-lg transition-all duration-300">
              <h3 className="text-[20px] leading-[130%] font-bold text-black/[0.72] mb-[16px]">
                Attention to Detail
              </h3>
              <p className="text-[14px] leading-[150%] text-black/[0.44]">
                We pride ourselves on our attention to detail, quick turnaround times, and ability to handle projects of any size. Whether it&apos;s a single custom piece or a large corporate order, we approach each project with the same level of dedication.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials - NEO Style */}
      <section className="py-[60px]">
        <Container>
          <div className="text-center mb-[40px]">
            <h2 className="text-[24px] lg:text-[32px] leading-[130%] font-bold text-black/[0.72]">
              What People Are Saying
            </h2>
            <p className="text-[14px] lg:text-[16px] leading-[130%] text-black/[0.44] mt-[8px]">
              Trusted by hundreds of satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-[24px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-[32px] bg-black/[0.03] rounded-[24px] hover:bg-black/[0.06] transition-all duration-300 group"
              >
                {/* Rating Stars */}
                <div className="flex gap-[4px] mb-[16px]">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-[16px] w-[16px] fill-current text-black/[0.44] group-hover:text-[#74CADC] transition-colors"
                    />
                  ))}
                </div>
                
                <p className="text-[14px] leading-[150%] mb-[16px] text-black/[0.72]">
                  &quot;{testimonial.quote}&quot;
                </p>
                
                <p className="text-[14px] font-bold text-black/[0.72]">
                  — {testimonial.author}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter Section - NEO Style */}
      <NewsletterSection variant="gradient" />
    </main>
  );
}
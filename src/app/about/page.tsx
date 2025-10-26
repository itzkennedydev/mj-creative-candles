"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, ArrowRight, Facebook, Instagram } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    quote: "Stitch, Please embroidered T-shirts and Polos for my church&apos;s 101st Anniversary. The owner &apos;Tanika&apos; did an outstanding job, she went above and beyond to make sure I (Mt. Zion) was satisfied! I (as well as other church members) was very pleased! I highly recommend Stitch, Please!",
    author: "Ivey"
  },
  {
    quote: "We walked in, we told her what we needed. We came back an hour and half later and the item was ready to go. It is perfect, exactly what I wanted. Very, very friendly! We will definitely recommend to others. Thank you!",
    author: "Jonna"
  },
  {
    quote: "She is just Amazing! Able to accommodate whatever your need may be and in an Awesome time frame! (I gave her her a last minute order and she not only completed it, but Exceeded expectations)",
    author: "Beth"
  },
  {
    quote: "Very creative and fast turn around time. Awesome that vinyl and embroidery are both offered!",
    author: "Jamie"
  }
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <Container>
      <div className="py-16 space-y-16">
        {/* About Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group">
            <Image
              src="/stitch.jpg"
              alt="Stitch Please Studio"
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1d1d1f] mb-4">Our Story</h2>
              <p className="text-[#1d1d1f]/60 leading-relaxed">
                From a home studio to the Quad Cities&apos; premier destination for custom embroidery and personalization services, our founder Tanika Zentic leads a passionate team of creative professionals dedicated to bringing your ideas to life through expert craftsmanship and attention to detail.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="p-6 rounded-2xl bg-[#f7f7f7]">
                <h3 className="text-xl font-semibold text-[#0A5565] mb-3">Experience & Expertise</h3>
                <p className="text-[#1d1d1f]/60">
                  With over a decade of experience in custom embroidery and personalization, Tanika has built a reputation for excellence and innovation in the Quad Cities area. Her expertise spans from intricate monogramming to large-scale commercial projects.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f7f7f7]">
                <h3 className="text-xl font-semibold text-[#0A5565] mb-3">Our Commitment</h3>
                <p className="text-[#1d1d1f]/60">
                  We pride ourselves on our attention to detail, quick turnaround times, and ability to handle projects of any size. Whether it&apos;s a single custom piece or a large corporate order, we approach each project with the same level of dedication and care.
                </p>
              </div>
            </div>

            <Button 
              size="lg"
              className="w-full bg-[#0A5565] hover:bg-[#0A5565]/90 text-white text-lg"
              onClick={() => router.push('/shop')}
            >
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Testimonials */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-[#1d1d1f] text-center">What People Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-6 rounded-2xl bg-[#f7f7f7]">
                <p className="text-[#1d1d1f]/60 mb-4">{testimonial.quote}</p>
                <p className="font-medium text-[#0A5565]">— {testimonial.author}</p>
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
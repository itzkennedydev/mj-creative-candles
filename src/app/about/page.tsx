"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

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
  return (
    <Container>
      <div className="py-16 space-y-16">
        {/* About Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
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

          <div className="space-y-6">
            <Card className="border border-zinc-200">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1d1d1f]">Meet Our Founder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-[#1d1d1f]/60 leading-relaxed">
                  At Stitch, Please!, our founder Tanika Zentic leads a passionate team of creative professionals dedicated to bringing your ideas to life through expert craftsmanship and attention to detail. Starting from humble beginnings in her home studio, Tanika has grown Stitch, Please! into the Quad Cities&apos; premier destination for custom embroidery and personalization services.
                </p>
                <div className="hidden lg:block">
                  <h3 className="text-lg font-semibold mb-2">Experience & Expertise</h3>
                  <p className="text-[#1d1d1f]/60 mb-4">
                    With over a decade of experience in custom embroidery and personalization, Tanika has built a reputation for excellence and innovation in the Quad Cities area. Her expertise spans from intricate monogramming to large-scale commercial projects, utilizing state-of-the-art equipment and techniques to deliver exceptional results. She has personally trained each team member to ensure the highest standards of quality and craftsmanship in every project.
                  </p>
                  <h3 className="text-lg font-semibold mb-2">Our Commitment</h3>
                  <p className="text-[#1d1d1f]/60">
                    Her commitment to quality and customer satisfaction has made Stitch, Please! the go-to destination for both individual and business clients seeking premium personalization services. We pride ourselves on our attention to detail, quick turnaround times, and ability to handle projects of any size. Whether it is a single custom piece or a large corporate order, we approach each project with the same level of dedication and care. Our team stays current with the latest industry trends and techniques to provide innovative solutions that exceed our clients&apos; expectations.
                  </p>
                </div>
                <Button 
                  size="lg"
                  className="w-full bg-[#0A5565] hover:bg-[#0A5565]/90 text-white text-lg"
                  onClick={() => window.open("https://stores.inksoft.com/StitchPlease_Custom_Embroidery/shop/design-studio/select-product", "_blank")}
                >
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <section className="space-y-12">
          <h2 className="text-3xl font-semibold text-[#1d1d1f] text-center">What People Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="group hover:bg-[#f7f7f7] transition-all border border-zinc-200">
                <CardContent className="p-8 space-y-4">
                  <p className="italic text-[#1d1d1f]/60 text-lg">{testimonial.quote}</p>
                  <p className="font-medium text-[#0A5565]">— {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <Card className="bg-[#f7f7f7] border border-zinc-200">
          <CardContent className="p-12 text-center space-y-8">
            <div className="max-w-2xl mx-auto space-y-4">
              <CardTitle className="text-3xl">Stay Updated</CardTitle>
              <CardDescription className="text-lg">
                Sign up with your email address to receive news and updates.
              </CardDescription>
            </div>
            
            <form className="max-w-md mx-auto space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
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
            <p className="text-sm text-[#1d1d1f]/50">We respect your privacy.</p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
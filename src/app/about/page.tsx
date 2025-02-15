"use client";

import Image from "next/image";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Stitch, Please embroidered T-shirts and Polos for my church&apos;s 101st Anniversary. The owner &quot;Tanika&quot; did an outstanding job, she went above and beyond to make sure I (Mt. Zion) was satisfied! I (as well as other church members) was very pleased! I highly recommend Stitch, Please!",
    author: "Ivey"
  },
  {
    quote: "We walked in, we told her what we needed. We came back an hour and half later and the item was ready to go. It's perfect, exactly what I wanted. Very, very friendly! We will definitely recommend to others. Thank you!",
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

const businessHours = [
  { day: "Monday", hours: "1pm-3pm" },
  { day: "Tuesday", hours: "1pm-3pm" },
  { day: "Wednesday", hours: "CLOSED" },
  { day: "Thursday", hours: "CLOSED" },
  { day: "Friday", hours: "1PM-3PM" },
  { day: "Saturday", hours: "CLOSED" },
  { day: "Sunday", hours: "CLOSED" },
];

export default function AboutPage() {
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
            <span className="text-sm font-medium">About Us</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900">About Stitch, Please!</h1>
          <p className="text-xl text-zinc-600 max-w-3xl mx-auto">
            Turn your ideas into amazing creations. Work with our team of specialists to make your visions come true!
          </p>
        </motion.section>

        {/* About Content */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-12 items-start"
        >
          <div className="space-y-8">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-8">
              <Image
                src="/stitch.jpg"
                alt="Tanika Zentic - Owner of Stitch, Please!"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-zinc-600">
                Tanika Zentic is a self motivated and creative designer looking to help you bring your ideas to life! She and her team do professional embroidery, custom signs; both wooden and canvas, team apparel, business logos, family reunions, church events, memorabilia items, personalized gift items, seasonal and promotional items and much more.
              </p>
              <p className="text-lg leading-relaxed text-zinc-600">
                Any and every customized project you're looking to produce, they can achieve it for you! In a time crunch? Not a problem! Tanika and her team work efficiently to meet your deadlines.
              </p>
            </div>
            <Button 
              size="lg"
              className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-lg w-full md:w-auto"
            >
              Start Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Contact Information */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-zinc-50 p-8 rounded-2xl space-y-8 border border-zinc-200"
          >
            <h2 className="text-2xl font-semibold text-zinc-900">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-[#0A5565] mt-1" />
                <div>
                  <h3 className="font-medium text-zinc-900">Email</h3>
                  <p className="text-zinc-600">pleasestitch18@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-[#0A5565] mt-1" />
                <div>
                  <h3 className="font-medium text-zinc-900">Phone</h3>
                  <p className="text-zinc-600">309-373-6017</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-[#0A5565] mt-1" />
                <div>
                  <h3 className="font-medium text-zinc-900">Visit Us</h3>
                  <p className="text-zinc-600">415 13th street Moline, IL 61265</p>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#0A5565]" />
                <h3 className="font-medium text-zinc-900">Business Hours</h3>
              </div>
              <div className="space-y-2">
                {businessHours.map((schedule) => (
                  <div key={schedule.day} className="flex justify-between text-sm">
                    <span className="font-medium text-zinc-900">{schedule.day}</span>
                    <span className="text-zinc-600">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Testimonials */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <h2 className="text-3xl font-semibold text-zinc-900 text-center">What People Are Saying</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl space-y-4 shadow-sm hover:shadow-md transition-all border border-zinc-100"
              >
                <p className="italic text-zinc-600 text-lg">"{testimonial.quote}"</p>
                <p className="font-medium text-[#0A5565]">— {testimonial.author}</p>
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
          
          <form className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white focus:border-[#74CADC] focus:ring-[#74CADC] transition-colors"
            />
            <Button 
              type="submit"
              size="lg"
              className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-lg"
            >
              Sign Up
              <Mail className="ml-2 h-5 w-5" />
            </Button>
          </form>
          <p className="text-sm text-zinc-500">We respect your privacy.</p>
        </motion.section>
      </div>
    </Container>
  );
} 
"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

// Business hours
const businessHours = [
  { day: "Monday", hours: "1–3 PM" },
  { day: "Tuesday", hours: "1–3 PM" },
  { day: "Wednesday", hours: "Closed" },
  { day: "Thursday", hours: "Closed" },
  { day: "Friday", hours: "1–3 PM" },
  { day: "Saturday", hours: "Closed" },
  { day: "Sunday", hours: "Closed" },
];

export default function ContactPage() {
  return (
    <Container>
      <div className="py-16 space-y-16">
        {/* Contact Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-[#1d1d1f]">Contact Us</h1>
          <p className="text-xl text-[#1d1d1f]/60 max-w-2xl mx-auto">
            Have questions or ready to start your custom project? Reach out to us using any of the methods below.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border border-zinc-200">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1d1d1f]">Visit Our Store</CardTitle>
              <CardDescription>
                Come see us during business hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-[#0A5565] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-[#1d1d1f]/60">415 13th St</p>
                  <p className="text-[#1d1d1f]/60">Moline, IL 61265</p>
                  <Button 
                    variant="link" 
                    className="text-[#0A5565] p-0 h-auto mt-2"
                    onClick={() => window.open("https://maps.google.com/?q=415+13th+St,+Moline+IL+61265", "_blank")}
                  >
                    Get Directions
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-[#0A5565] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {businessHours.map((item, index) => (
                      <React.Fragment key={index}>
                        <p className="font-medium">{item.day}</p>
                        <p className="text-[#1d1d1f]/60">{item.hours}</p>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-zinc-200">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1d1d1f]">Get In Touch</CardTitle>
              <CardDescription>
                We&apos;d love to hear from you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-[#0A5565] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-[#1d1d1f]/60">(309) 373-6017</p>
                  <p className="text-sm text-[#1d1d1f]/40 mt-1">Call or text during business hours</p>
                  <Button 
                    variant="link" 
                    className="text-[#0A5565] p-0 h-auto mt-1"
                    onClick={() => window.open("tel:3093736017", "_blank")}
                  >
                    Call Now
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-[#0A5565] shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-[#1d1d1f]/60">pleasestitch18@gmail.com</p>
                  <p className="text-sm text-[#1d1d1f]/40 mt-1">We&apos;ll respond as soon as possible</p>
                  <Button 
                    variant="link" 
                    className="text-[#0A5565] p-0 h-auto mt-1"
                    onClick={() => window.open("mailto:pleasestitch18@gmail.com", "_blank")}
                  >
                    Send Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="border border-zinc-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#1d1d1f]">Send Us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6 max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-[#0A5565] focus:ring-[#0A5565] transition-colors"
                ></textarea>
              </div>
              
              <Button 
                type="submit"
                size="lg"
                className="w-full bg-[#0A5565] hover:bg-[#083d4a] text-white text-lg font-semibold rounded-xl py-4"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
} 
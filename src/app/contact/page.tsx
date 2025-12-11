"use client";

import React from "react";
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
      <div className="space-y-16 py-16">
        {/* Contact Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-[#1d1d1f]">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-xl text-[#1d1d1f]/60">
            Have questions about our candles? We&apos;d love to hear from you.
            Reach out using any of the methods below.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border border-zinc-200">
            <CardHeader>
              <CardTitle className="text-2xl text-[#1d1d1f]">
                Visit Our Store
              </CardTitle>
              <CardDescription>
                Come see us during business hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="mt-1 h-6 w-6 shrink-0 text-[#1d1d1f]" />
                <div>
                  <h3 className="mb-1 font-semibold">Email</h3>
                  <p className="text-[#1d1d1f]/60">
                    hello@mjcreativecandles.com
                  </p>
                  <p className="mt-1 text-sm text-[#1d1d1f]/40">
                    We&apos;ll respond within 24 hours
                  </p>
                  <Button
                    variant="link"
                    className="mt-1 h-auto p-0 text-[#1d1d1f]"
                    onClick={() =>
                      window.open(
                        "mailto:hello@mjcreativecandles.com",
                        "_blank",
                      )
                    }
                  >
                    Send Email
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="mt-1 h-6 w-6 shrink-0 text-[#1d1d1f]" />
                <div>
                  <h3 className="mb-2 font-semibold">Business Hours</h3>
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
              <CardTitle className="text-2xl text-[#1d1d1f]">
                Get In Touch
              </CardTitle>
              <CardDescription>We&apos;d love to hear from you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="mt-1 h-6 w-6 shrink-0 text-[#1d1d1f]" />
                <div>
                  <h3 className="mb-1 font-semibold">Phone</h3>
                  <p className="text-[#1d1d1f]/60">(309) 373-6017</p>
                  <p className="mt-1 text-sm text-[#1d1d1f]/40">
                    Call or text during business hours
                  </p>
                  <Button
                    variant="link"
                    className="mt-1 h-auto p-0 text-[#1d1d1f]"
                    onClick={() => window.open("tel:3093736017", "_blank")}
                  >
                    Call Now
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="mt-1 h-6 w-6 shrink-0 text-[#1d1d1f]" />
                <div>
                  <h3 className="mb-1 font-semibold">Email</h3>
                  <p className="text-[#1d1d1f]/60">pleasestitch18@gmail.com</p>
                  <p className="mt-1 text-sm text-[#1d1d1f]/40">
                    We&apos;ll respond as soon as possible
                  </p>
                  <Button
                    variant="link"
                    className="mt-1 h-auto p-0 text-[#1d1d1f]"
                    onClick={() =>
                      window.open("mailto:pleasestitch18@gmail.com", "_blank")
                    }
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
            <CardTitle className="text-2xl text-[#1d1d1f]">
              Send Us a Message
            </CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you as soon as
              possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="mx-auto max-w-2xl space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
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
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 transition-colors focus:border-[#1d1d1f] focus:ring-[#1d1d1f]"
                ></textarea>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl bg-[#1d1d1f] py-4 text-lg font-semibold text-white hover:bg-[#0a0a0a]"
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

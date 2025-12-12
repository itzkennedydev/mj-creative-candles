"use client";

import React from "react";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function ContactPage() {
  return (
    <Container>
      <div className="space-y-16 py-16">
        {/* Contact Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-[#1d1d1f]">Contact Us</h1>
          <p className="mx-auto max-w-2xl text-xl text-[#1d1d1f]/60">
            Have questions about our candles? We&apos;d love to hear from you.
            Fill out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>
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

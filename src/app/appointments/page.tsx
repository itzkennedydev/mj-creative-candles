"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Container } from "~/components/ui/container";
import { ArrowRight } from "lucide-react";
import { AppointmentForm } from "~/components/appointments/AppointmentForm";

export default function MobileEmbroideryPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm sm:p-4">
          <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white sm:max-h-[90vh] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Book Your Event
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <div className="p-4 sm:p-6">
              <AppointmentForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <div className="bg-white py-12 sm:py-16 md:py-20 lg:py-24">
        <Container>
          <div className="mb-16 flex flex-col items-start gap-8 sm:mb-20 sm:gap-12 lg:mb-24 lg:flex-row lg:gap-16">
            <div className="w-full lg:w-1/2">
              <div className="relative h-[400px] overflow-hidden rounded-xl shadow-lg sm:h-[500px] sm:rounded-2xl sm:shadow-2xl md:h-[1000px]">
                <Image
                  src="/Mobile.jpeg"
                  alt="Mobile Embroidery"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-center lg:text-left">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-6 sm:text-3xl md:text-4xl">
                  Ready to make your event special?
                </h2>
                <p className="mb-6 text-base leading-relaxed text-gray-600 sm:mb-8 sm:text-lg md:text-xl">
                  At MJ Creative Candles, we believe every event deserves a
                  touch of personalization. Our mobile embroidery service brings
                  professional quality and convenience right to your venue.
                  Whether it&apos;s a corporate team-building event, school
                  spirit day, or a special celebration, we&apos;ll help create
                  lasting memories with custom-embroidered items that your
                  guests will cherish.
                </p>
                <p className="mb-8 text-base leading-relaxed text-gray-600 sm:mb-10 sm:text-lg md:text-xl lg:mb-12">
                  Our experienced team handles everything from setup to cleanup,
                  ensuring a seamless experience for you and your guests. With
                  state-of-the-art equipment and a wide range of design options,
                  we make it easy to create unique, high-quality embroidered
                  items on the spot.
                </p>

                <div className="mb-12 text-center sm:mb-16 lg:text-left">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-6 sm:text-3xl">
                    How It Works
                  </h3>
                  <p className="mb-8 text-base leading-relaxed text-gray-600 sm:mb-10 sm:text-lg md:text-xl lg:mb-12">
                    Simple process, amazing results. Here&apos;s how we make
                    your event special.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                  <div className="relative rounded-xl bg-[#F8FAFC] p-6 text-center sm:rounded-2xl sm:p-8">
                    <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#0A5565] text-sm font-bold text-white sm:-top-4 sm:h-8 sm:w-8 sm:text-base">
                      1
                    </div>
                    <h3 className="mb-3 mt-3 text-lg font-bold text-gray-900 sm:mb-4 sm:mt-4 sm:text-xl">
                      Schedule Your Event
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      Choose your preferred date and time through our easy
                      online booking system. We&apos;ll confirm your reservation
                      and discuss your event details.
                    </p>
                  </div>

                  <div className="relative rounded-xl bg-[#F8FAFC] p-6 text-center sm:rounded-2xl sm:p-8">
                    <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#0A5565] text-sm font-bold text-white sm:-top-4 sm:h-8 sm:w-8 sm:text-base">
                      2
                    </div>
                    <h3 className="mb-3 mt-3 text-lg font-bold text-gray-900 sm:mb-4 sm:mt-4 sm:text-xl">
                      Choose Your Designs
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      Browse our extensive design collection or share your
                      custom artwork. We&apos;ll help you select the perfect
                      design for your event.
                    </p>
                  </div>

                  <div className="relative rounded-xl bg-[#F8FAFC] p-6 text-center sm:col-span-2 sm:rounded-2xl sm:p-8 lg:col-span-1">
                    <div className="absolute -top-3 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-[#0A5565] text-sm font-bold text-white sm:-top-4 sm:h-8 sm:w-8 sm:text-base">
                      3
                    </div>
                    <h3 className="mb-3 mt-3 text-lg font-bold text-gray-900 sm:mb-4 sm:mt-4 sm:text-xl">
                      Enjoy On-Site Service
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      We&apos;ll arrive at your venue with all necessary
                      equipment. Watch as we create beautiful embroidered items
                      right before your eyes.
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center sm:mt-12 lg:mt-16">
                  <Button
                    className="h-auto w-full rounded-xl bg-[#0A5565] px-6 py-3 text-base font-semibold text-white hover:bg-[#083d4a] sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
                    onClick={() => setShowForm(true)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Floating Action Button - Mobile Only */}
      <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
        <Button
          className="h-auto w-full rounded-xl bg-[#0A5565] px-8 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-[#083d4a]"
          onClick={() => setShowForm(true)}
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

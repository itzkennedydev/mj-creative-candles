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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Book Your Event</h2>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
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
      <div className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-start mb-16 sm:mb-20 lg:mb-24">
            <div className="w-full lg:w-1/2">
              <div className="relative h-[400px] sm:h-[500px] md:h-[1000px] rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-2xl">
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
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Ready to make your event special?</h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  At MJ Creative Candles, we believe every event deserves a touch of personalization. Our mobile embroidery service brings professional quality and convenience right to your venue. Whether it&apos;s a corporate team-building event, school spirit day, or a special celebration, we&apos;ll help create lasting memories with custom-embroidered items that your guests will cherish.
                </p>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 leading-relaxed">
                  Our experienced team handles everything from setup to cleanup, ensuring a seamless experience for you and your guests. With state-of-the-art equipment and a wide range of design options, we make it easy to create unique, high-quality embroidered items on the spot.
                </p>

                <div className="text-center lg:text-left mb-12 sm:mb-16">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How It Works</h3>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 leading-relaxed">Simple process, amazing results. Here&apos;s how we make your event special.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  <div className="bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative">
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 mt-3 sm:mt-4">Schedule Your Event</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Choose your preferred date and time through our easy online booking system. We&apos;ll confirm your reservation and discuss your event details.</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative">
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 mt-3 sm:mt-4">Choose Your Designs</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">Browse our extensive design collection or share your custom artwork. We&apos;ll help you select the perfect design for your event.</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative sm:col-span-2 lg:col-span-1">
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-[#1d1d1f] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 mt-3 sm:mt-4">Enjoy On-Site Service</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">We&apos;ll arrive at your venue with all necessary equipment. Watch as we create beautiful embroidered items right before your eyes.</p>
                  </div>
                </div>

                <div className="text-center mt-8 sm:mt-12 lg:mt-16">
                  <Button
                    className="bg-[#1d1d1f] hover:bg-[#0a0a0a] text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 h-auto rounded-xl text-base sm:text-lg w-full sm:w-auto"
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
          className="bg-[#1d1d1f] hover:bg-[#0a0a0a] text-white font-semibold px-8 py-4 h-auto rounded-xl text-lg w-full transition-colors duration-200"
          onClick={() => setShowForm(true)}
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Book Your Event</h2>
              <Button
                variant="ghost"
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
              >
                ×
              </Button>
            </div>
            <div className="p-6">
              <AppointmentForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Section */}
      <div className="py-24 bg-white">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
            <div className="w-full lg:w-1/2">
              <div className="relative h-[700px] md:h-[1000px] rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="/Mobile.jpeg" 
                  alt="Mobile Embroidery" 
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to make your event special?</h2>
                <p className="text-xl text-gray-600 mb-8">
                  At Stitch Please, we believe every event deserves a touch of personalization. Our mobile embroidery service brings professional quality and convenience right to your venue. Whether it&apos;s a corporate team-building event, school spirit day, or a special celebration, we&apos;ll help create lasting memories with custom-embroidered items that your guests will cherish.
                </p>
                <p className="text-xl text-gray-600 mb-12">
                  Our experienced team handles everything from setup to cleanup, ensuring a seamless experience for you and your guests. With state-of-the-art equipment and a wide range of design options, we make it easy to create unique, high-quality embroidered items on the spot.
                </p>

                <div className="text-center lg:text-left mb-16">
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h3>
                  <p className="text-xl text-gray-600 mb-12">Simple process, amazing results. Here&apos;s how we make your event special.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A5565] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 mt-4">Schedule Your Event</h3>
                    <p className="text-gray-600">Choose your preferred date and time through our easy online booking system. We&apos;ll confirm your reservation and discuss your event details.</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A5565] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 mt-4">Choose Your Designs</h3>
                    <p className="text-gray-600">Browse our extensive design collection or share your custom artwork. We&apos;ll help you select the perfect design for your event.</p>
                  </div>
                  
                  <div className="bg-[#F8FAFC] rounded-2xl p-8 text-center relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0A5565] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 mt-4">Enjoy On-Site Service</h3>
                    <p className="text-gray-600">We&apos;ll arrive at your venue with all necessary equipment. Watch as we create beautiful embroidered items right before your eyes.</p>
                  </div>
                </div>

                <div className="text-center mt-16">
                  <Button
                    className="bg-[#0A5565] hover:bg-[#074651] text-white font-medium px-8 py-4 h-auto rounded-xl text-lg"
                    onClick={() => setShowForm(true)}
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
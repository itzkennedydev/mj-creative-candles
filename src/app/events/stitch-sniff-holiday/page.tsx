"use client";

import React from "react";
import Image from "next/image";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Calendar, MapPin, Clock, Camera, Bone, Gift, PawPrint, Wrench, Facebook, Instagram } from "lucide-react";

export default function StitchSniffHolidayEvent() {
  const activities = [
    {
      icon: Camera,
      title: "Photo Booth",
      description: "Capture memories with your furry friend"
    },
    {
      icon: Bone,
      title: "Dog Snacks",
      description: "Special treats for our four-legged guests"
    },
    {
      icon: Gift,
      title: "Dog Stockings",
      description: "Holiday stockings for your pup"
    },
    {
      icon: PawPrint,
      title: "Dog Xmas Outfits",
      description: "Festive attire for the holidays"
    },
    {
      icon: Wrench,
      title: "Make Your Own Paw Print Ornament",
      description: "Create a keepsake ornament"
    },
    {
      icon: Wrench,
      title: "Customize Leashes and Collars",
      description: "Personalize your dog's accessories"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <Container>
          <div className="py-8 md:py-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-3 md:mb-4">
              STITCH & SNIFF
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              HOLIDAY EVENT
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-600">
              Hosted by Stitch, Please Custom Embroidery
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container>
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Column - Event Details */}
            <div className="space-y-6 md:space-y-8">
              {/* Activities */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Gift className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">Event Activities</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="bg-gray-50 rounded-xl p-3 md:p-4">
                        <div className="flex items-center gap-2 mb-2 md:mb-3">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                          <h4 className="text-sm md:text-base font-semibold text-gray-900">{activity.title}</h4>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600">{activity.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">Date & Time</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Saturday,</p>
                  <p className="text-base md:text-lg font-bold text-gray-900">December 6th</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                    <p className="text-xs md:text-sm text-gray-600">11:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 hover:border-gray-300 transition-all duration-200 ease-in-out">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                  <h3 className="text-sm md:text-base font-semibold text-gray-900">Location</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">415 13th St.</p>
                  <p className="text-xs md:text-sm text-gray-600">Moline, IL 61265</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button
                  className="bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium rounded-xl w-full sm:w-auto"
                  onClick={() => window.open("https://maps.google.com/?q=415+13th+St,+Moline+IL+61265", "_blank")}
                >
                  Get Directions
                </Button>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="flex justify-center lg:justify-end order-first lg:order-last">
              <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px] rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/IMG_9615.jpg"
                    alt="Stitch & Sniff Holiday Event - Woman with Golden Retriever in Buffalo Plaid"
                    width={700}
                    height={800}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200">
        <Container>
          <div className="py-8 md:py-12 text-center">
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
              <p className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                Door prizes • Holiday music • Festive fun for all!
              </p>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                Follow us on Facebook and Instagram for sneak peeks!
              </p>
              <div className="flex justify-center space-x-6">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#74CADC] transition-colors"
                >
                  <Facebook className="h-6 w-6 md:h-8 md:w-8" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-[#74CADC] transition-colors"
                >
                  <Instagram className="h-6 w-6 md:h-8 md:w-8" />
                </a>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

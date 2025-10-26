"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export function EventPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Debug: Force show for testing
  // const [isVisible, setIsVisible] = useState(true);
  // const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if popup was previously dismissed
    const dismissed = localStorage.getItem('event-popup-dismissed');
    console.log('EventPopup: dismissed check:', dismissed);
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      console.log('EventPopup: showing popup');
      setIsVisible(true);
    }, 2000);

    // Auto-hide after 15 seconds (13 seconds after appearing)
    const autoHideTimer = setTimeout(() => {
      console.log('EventPopup: auto-hiding popup');
      setIsVisible(false);
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoHideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('event-popup-dismissed', 'true');
  };

  if (isDismissed || !isVisible) {
    console.log('EventPopup: not rendering, isDismissed:', isDismissed, 'isVisible:', isVisible);
    return null;
  }

  console.log('EventPopup: rendering popup');

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999] flex items-center justify-center px-4 py-4" style={{ margin: 0, width: '100vw', height: '100vh' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative animate-in fade-in-0 zoom-in-95 duration-300 mx-2">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Image */}
        <div className="relative h-48 rounded-t-2xl overflow-hidden">
          <Image
            src="/IMG_9615.jpg"
            alt="Stitch & Sniff Holiday Event"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-lg font-bold">STITCH & SNIFF</h3>
            <p className="text-sm opacity-90">Holiday Event</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Event Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Saturday, December 6th</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>11:00 AM – 4:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>415 13th St., Moline</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">
              Join us for a festive holiday event with photo booths, dog treats, custom ornaments, and more fun activities for you and your furry friends!
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-3 pt-2">
              <Link href="/events/stitch-sniff-holiday" className="flex-1">
                <Button className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] text-sm font-medium">
                  Learn More
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="px-4 text-sm"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

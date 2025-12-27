"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Container } from "~/components/ui/container";
import { IMAGE_URLS } from "~/lib/image-config";

function FooterComponent() {
  const [storeInfo, setStoreInfo] = useState({
    name: "MJ Creative Candles",
    email: "hello@mjcreativecandles.com",
    phone: "(555) 123-CANDLE",
  });

  useEffect(() => {
    // Load store info from localStorage
    const loadStoreInfo = () => {
      try {
        const stored = localStorage.getItem("mj_creative_store_info");
        if (stored) {
          const parsedStoreInfo = JSON.parse(stored) as {
            name: string;
            email: string;
            phone: string;
          };
          setStoreInfo(parsedStoreInfo);
        }
      } catch (error) {
        console.error("Error loading store info:", error);
      }
    };

    loadStoreInfo();

    // Listen for store info updates
    const handleStoreInfoUpdate = () => {
      loadStoreInfo();
    };

    window.addEventListener("storeInfoUpdated", handleStoreInfoUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "mj_creative_store_info") {
        loadStoreInfo();
      }
    });

    return () => {
      window.removeEventListener("storeInfoUpdated", handleStoreInfoUpdate);
    };
  }, []);

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-900">
      <Container>
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="mb-6 flex items-center">
                <Image
                  src={IMAGE_URLS.logo.main}
                  alt="MJ Creative Candles"
                  width={50}
                  height={50}
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                />
                <div className="ml-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {storeInfo.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hand-poured with love, crafted for your home
                  </p>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/mjcreative_candles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-100"
                >
                  <Instagram className="h-5 w-5 text-gray-600" />
                </a>
                <a
                  href="https://facebook.com/mjcreativecandles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-100"
                >
                  <Facebook className="h-5 w-5 text-gray-600" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-900">
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Shop All
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?featured=true"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Featured Items
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?sort=newest"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shop?sale=true"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    On Sale
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-900">
                Customer Service
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/track-order"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link
                    href="/returns"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/candle-care"
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Candle Care
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-gray-900">
                Get In Touch
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">{storeInfo.email}</p>
                    <p className="text-xs text-gray-500">
                      We&apos;ll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">{storeInfo.phone}</p>
                    <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Hand-poured in the USA
                    </p>
                    <p className="text-xs text-gray-500">
                      Small batch, big love
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-6">
                <h5 className="mb-3 text-sm font-medium text-gray-900">
                  Stay Updated
                </h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-l-sm border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
                    suppressHydrationWarning={true}
                  />
                  <button className="rounded-r-sm bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                    Subscribe
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Get 10% off your first order
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-gray-500">
              © 2025 {storeInfo.name}. All rights reserved.
            </div>

            <div className="flex flex-col items-center space-y-2 md:flex-row md:space-x-6 md:space-y-0">
              <div className="text-sm text-gray-500">
                Created by{" "}
                <a
                  href="https://sovereigncreative.agency/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-700 transition-colors hover:text-gray-900"
                >
                  Sovereign Creative Agency
                </a>
              </div>

              <div className="flex space-x-6">
                <Link
                  href="/privacy"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// Memoize Footer to prevent unnecessary re-renders
export const Footer = memo(FooterComponent);

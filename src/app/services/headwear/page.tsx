"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HeadwearPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Container>
        {/* Header */}
        <div className="pt-8 pb-6">
          <Link href="/services" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Headwear Embroidery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Complete your look with custom embroidered headwear. From baseball caps to beanies, 
            we create professional headwear that represents your brand or style.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
          <Image
            src="/categories/Hats.jpg"
            alt="Headwear Embroidery Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Custom Headwear</h2>
            <p className="text-lg opacity-90">Caps, beanies, and more with your design</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">⚾</div>
            <h3 className="text-xl font-semibold mb-3">Baseball Caps</h3>
            <p className="text-gray-600 mb-4">
              Classic baseball caps with embroidered logos, team names, or custom designs. 
              Perfect for sports teams and promotional events.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Team logos</li>
              <li>• Company branding</li>
              <li>• Custom graphics</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🧢</div>
            <h3 className="text-xl font-semibold mb-3">Beanies & Winter Hats</h3>
            <p className="text-gray-600 mb-4">
              Warm winter headwear with embroidered designs. Great for cold weather 
              branding and personal style.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Knit beanies</li>
              <li>• Fleece hats</li>
              <li>• Winter accessories</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">👒</div>
            <h3 className="text-xl font-semibold mb-3">Visors & Headbands</h3>
            <p className="text-gray-600 mb-4">
              Sporty visors and headbands with handcrafted candles. Ideal for athletic 
              teams and outdoor activities.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Sports visors</li>
              <li>• Sweatbands</li>
              <li>• Athletic headwear</li>
            </ul>
          </div>
        </div>

        {/* Product Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Headwear Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Baseball Caps", icon: "⚾" },
              { name: "Trucker Hats", icon: "🚛" },
              { name: "Beanies", icon: "🧢" },
              { name: "Visors", icon: "👒" },
              { name: "Headbands", icon: "🎀" },
              { name: "Bucket Hats", icon: "🪣" },
              { name: "Snapbacks", icon: "🔗" },
              { name: "Dad Hats", icon: "👨" }
            ].map((item) => (
              <div key={item.name} className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Headwear?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">High-Quality Materials</h3>
                  <p className="text-gray-600">We use only premium headwear that lasts through wear and washing.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Precise Embroidery</h3>
                  <p className="text-gray-600">Professional embroidery machines ensure clean, crisp designs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Fast Turnaround</h3>
                  <p className="text-gray-600">Quick production times without compromising on quality.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Custom Designs</h3>
                  <p className="text-gray-600">We can digitize and embroider any design you provide.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Bulk Orders</h3>
                  <p className="text-gray-600">Special pricing for large quantity orders and team uniforms.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Color Matching</h3>
                  <p className="text-gray-600">We match thread colors to your brand specifications.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Order Custom Headwear?</h2>
          <p className="text-xl mb-6 opacity-90">
            Contact us today for a free consultation and quote on your headwear embroidery project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Get Quote
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="tel:+1234567890">
                <Phone className="w-5 h-5 mr-2" />
                Call Now
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}

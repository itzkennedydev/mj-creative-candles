"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AccessoriesPage() {
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
            Accessories & Specialty Items
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Complete your branding with custom embroidered accessories. From bags and patches 
            to promotional items, we handle all your specialty embroidery needs.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
          <Image
            src="/categories/ACS.jpeg"
            alt="Accessories Embroidery Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Custom Accessories</h2>
            <p className="text-lg opacity-90">Bags, patches, and promotional items</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎒</div>
            <h3 className="text-xl font-semibold mb-3">Bags & Backpacks</h3>
            <p className="text-gray-600 mb-4">
              Custom embroidered bags, backpacks, and totes. Perfect for promotional 
              events, corporate gifts, and personal use.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Canvas bags</li>
              <li>• Backpacks</li>
              <li>• Tote bags</li>
              <li>• Sports bags</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold mb-3">Patches & Badges</h3>
            <p className="text-gray-600 mb-4">
              Custom embroidered patches and badges for uniforms, jackets, and accessories. 
              Great for team identification and branding.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Iron-on patches</li>
              <li>• Sew-on patches</li>
              <li>• Name badges</li>
              <li>• Achievement patches</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-3">Promotional Items</h3>
            <p className="text-gray-600 mb-4">
              Small promotional items with handcrafted candles. Perfect for giveaways, 
              trade shows, and marketing campaigns.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Koozies</li>
              <li>• Keychains</li>
              <li>• Small accessories</li>
              <li>• Corporate gifts</li>
            </ul>
          </div>
        </div>

        {/* Product Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Accessory Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Canvas Bags", icon: "👜" },
              { name: "Backpacks", icon: "🎒" },
              { name: "Tote Bags", icon: "🛍️" },
              { name: "Sports Bags", icon: "⚽" },
              { name: "Patches", icon: "🏷️" },
              { name: "Koozies", icon: "🍺" },
              { name: "Keychains", icon: "🔑" },
              { name: "Masks", icon: "😷" }
            ].map((item) => (
              <div key={item.name} className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Special Services */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Special Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-center">Bulk Orders</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Volume discounts available</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Consistent quality across all items</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Fast production times</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Flexible delivery options</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-center">Custom Design</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Artwork digitization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Color matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Design consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Sample production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Consultation", desc: "Discuss your accessory needs and design" },
              { step: "2", title: "Design", desc: "Create or digitize your artwork" },
              { step: "3", title: "Production", desc: "Embroider with precision and care" },
              { step: "4", title: "Quality Check", desc: "Inspect and package for delivery" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Customize Your Accessories?</h2>
          <p className="text-xl mb-6 opacity-90">
            Contact us today for a free consultation and quote on your accessory embroidery project.
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

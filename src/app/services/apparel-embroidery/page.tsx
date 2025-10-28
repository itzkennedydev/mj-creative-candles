"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ApparelEmbroideryPage() {
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
            Apparel Embroidery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Transform your clothing with premium embroidered designs. From business logos to personal names, 
            we create stunning embroidered apparel that stands out.
          </p>
        </div>

        {/* Hero Image */}
        <div className="relative h-64 md:h-96 mb-12 rounded-2xl overflow-hidden">
          <Image
            src="/categories/Tops.jpeg"
            alt="Apparel Embroidery Services"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Professional Embroidery</h2>
            <p className="text-lg opacity-90">Quality that lasts, designs that impress</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold mb-3">Business Logos</h3>
            <p className="text-gray-600 mb-4">
              Professional logo embroidery for uniforms, polos, and corporate apparel. 
              Perfect for branding and team identity.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Corporate uniforms</li>
              <li>• Team apparel</li>
              <li>• Promotional items</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-3">Names & Numbers</h3>
            <p className="text-gray-600 mb-4">
              Personalized embroidery with names, numbers, and custom text. 
              Great for sports teams and personal items.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Sports jerseys</li>
              <li>• Personalized gifts</li>
              <li>• Team identification</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-3">Custom Designs</h3>
            <p className="text-gray-600 mb-4">
              Unique custom embroidery designs tailored to your vision. 
              From simple graphics to complex artwork.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Original artwork</li>
              <li>• Custom graphics</li>
              <li>• Special occasions</li>
            </ul>
          </div>
        </div>

        {/* Product Types */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What We Embroider</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "T-Shirts", icon: "👕" },
              { name: "Hoodies", icon: "🧥" },
              { name: "Polo Shirts", icon: "👔" },
              { name: "Jackets", icon: "🧥" },
              { name: "Baby Clothes", icon: "👶" },
              { name: "Sports Wear", icon: "⚽" },
              { name: "Wedding Attire", icon: "💒" },
              { name: "Robes", icon: "🛁" }
            ].map((item) => (
              <div key={item.name} className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Consultation", desc: "Discuss your design and requirements" },
              { step: "2", title: "Design", desc: "Create or digitize your artwork" },
              { step: "3", title: "Production", desc: "Embroider with precision and care" },
              { step: "4", title: "Delivery", desc: "Quality check and pickup/delivery" }
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
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6 opacity-90">
            Contact us today for a free consultation and quote on your embroidery project.
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

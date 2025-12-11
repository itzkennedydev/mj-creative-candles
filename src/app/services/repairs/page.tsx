"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, ArrowLeft, Scissors, RefreshCw, Shield } from "lucide-react";
import Link from "next/link";

export default function RepairsPage() {
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
            Embroidery Repairs & Alterations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Restore your embroidered items to their original beauty. We specialize in repairing 
            damaged embroidery, fixing loose threads, and refreshing faded designs.
          </p>
        </div>

        {/* Repair Services */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🧵</div>
            <h3 className="text-xl font-semibold mb-3">Thread Repair</h3>
            <p className="text-gray-600 mb-4">
              Fix loose threads, replace damaged embroidery, and restore the original 
              appearance of your embroidered items.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Loose thread repair</li>
              <li>• Missing thread replacement</li>
              <li>• Color matching</li>
              <li>• Thread reinforcement</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold mb-3">Design Refresh</h3>
            <p className="text-gray-600 mb-4">
              Update faded or worn embroidery with fresh thread and improved techniques. 
              Give your items a new lease on life.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Faded design restoration</li>
              <li>• Color enhancement</li>
              <li>• Design updates</li>
              <li>• Quality improvement</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">✂️</div>
            <h3 className="text-xl font-semibold mb-3">Alterations</h3>
            <p className="text-gray-600 mb-4">
              Modify existing embroidery to fit new requirements, change sizes, 
              or update information on embroidered items.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Size adjustments</li>
              <li>• Name changes</li>
              <li>• Logo updates</li>
              <li>• Information updates</li>
            </ul>
          </div>
        </div>

        {/* What We Repair */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What We Can Repair</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "T-Shirts", icon: "👕" },
              { name: "Hoodies", icon: "🧥" },
              { name: "Caps", icon: "🧢" },
              { name: "Jackets", icon: "🧥" },
              { name: "Bags", icon: "🎒" },
              { name: "Uniforms", icon: "👔" },
              { name: "Sports Jerseys", icon: "⚽" },
              { name: "Patches", icon: "🏷️" }
            ].map((item) => (
              <div key={item.name} className="text-center p-4 bg-white rounded-lg shadow-md">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Repair Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Repair Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Assessment", desc: "Evaluate the damage and repair options" },
              { step: "2", title: "Quote", desc: "Provide repair cost and timeline estimate" },
              { step: "3", title: "Repair", desc: "Perform the necessary repairs and restoration" },
              { step: "4", title: "Quality Check", desc: "Inspect finished work and prepare for pickup" }
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

        {/* Repair Guarantee */}
        <div className="bg-green-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Repair Guarantee</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">We stand behind our repair work with a satisfaction guarantee.</p>
            </div>
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professional Service</h3>
              <p className="text-gray-600">Experienced technicians using professional-grade equipment.</p>
            </div>
            <div className="text-center">
              <Scissors className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Careful Handling</h3>
              <p className="text-gray-600">Your items are handled with care throughout the repair process.</p>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Repair Pricing</h2>
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Simple Repairs</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Loose thread repair: $5-15</li>
                  <li>• Small hole repair: $10-25</li>
                  <li>• Thread replacement: $15-30</li>
                  <li>• Minor touch-ups: $10-20</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Complex Repairs</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Complete design restoration: $25-75</li>
                  <li>• Logo updates: $20-50</li>
                  <li>• Name changes: $15-40</li>
                  <li>• Major alterations: $30-100</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-center text-gray-700">
                <strong>Note:</strong> Pricing varies based on complexity and materials needed. 
                We provide free estimates for all repair work.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Need Your Embroidery Repaired?</h2>
          <p className="text-xl mb-6 opacity-90">
            Contact us today for a free repair estimate. We'll assess your item and provide 
            a detailed quote for the restoration work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Get Repair Quote
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

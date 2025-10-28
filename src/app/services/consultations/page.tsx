"use client";

import React from 'react';
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { Mail, Phone, ArrowLeft, Calendar, Clock, Users } from "lucide-react";
import Link from "next/link";

export default function ConsultationsPage() {
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
            Design Consultations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Get expert advice on your embroidery project. Our design consultations help you 
            create the perfect custom design for your needs.
          </p>
        </div>

        {/* Consultation Types */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold mb-3">Business Branding</h3>
            <p className="text-gray-600 mb-4">
              Professional consultation for corporate uniforms, promotional items, 
              and business branding projects.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Logo placement advice</li>
              <li>• Color selection</li>
              <li>• Material recommendations</li>
              <li>• Quantity planning</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold mb-3">Sports Teams</h3>
            <p className="text-gray-600 mb-4">
              Specialized consultation for sports uniforms, team apparel, and 
              athletic gear customization.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Jersey design</li>
              <li>• Number placement</li>
              <li>• Team colors</li>
              <li>• Durability considerations</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-3">Custom Design</h3>
            <p className="text-gray-600 mb-4">
              Creative consultation for unique designs, special events, and 
              personalized embroidery projects.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Design concept development</li>
              <li>• Artwork digitization</li>
              <li>• Size and placement</li>
              <li>• Special effects</li>
            </ul>
          </div>
        </div>

        {/* Consultation Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Consultation Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Initial Contact", desc: "Call or email to schedule consultation" },
              { step: "2", title: "Project Discussion", desc: "Review your needs and requirements" },
              { step: "3", title: "Design Planning", desc: "Create design concepts and recommendations" },
              { step: "4", title: "Quote & Timeline", desc: "Provide pricing and production schedule" }
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

        {/* What to Bring */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">What to Bring</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">📄</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Design Ideas</h3>
                  <p className="text-gray-600">Sketches, logos, or reference images for your project.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">📏</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Size Requirements</h3>
                  <p className="text-gray-600">Specific dimensions or placement preferences.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">🎨</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Color Preferences</h3>
                  <p className="text-gray-600">Brand colors or specific color requirements.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">📅</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Timeline</h3>
                  <p className="text-gray-600">When you need the project completed.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">🔢</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Quantity</h3>
                  <p className="text-gray-600">How many items you need embroidered.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold">👕</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sample Items</h3>
                  <p className="text-gray-600">Items you want embroidered (if available).</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Benefits */}
        <div className="bg-blue-50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Schedule a Consultation?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Save time with expert guidance</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Professional design recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Accurate timeline planning</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Avoid costly design mistakes</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Get the best value for your budget</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-green-600 font-bold">✓</span>
                <span>Ensure quality results</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Schedule Your Consultation?</h2>
          <p className="text-xl mb-6 opacity-90">
            Contact us today to schedule your free design consultation and get expert advice on your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2" />
                Schedule Consultation
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

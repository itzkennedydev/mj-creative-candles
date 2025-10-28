"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { useToast } from "~/lib/toast-context";

export default function AccessRequestPage() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/access-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        addToast({
          title: "Access Request Submitted",
          description: "Your request has been sent to the administrators. You will be notified when it is reviewed.",
          type: "success"
        });
      } else {
        const data = await response.json();
        addToast({
          title: "Request Failed",
          description: data.error || "Failed to submit access request. Please try again.",
          type: "error"
        });
      }
    } catch (error) {
      addToast({
        title: "Request Failed",
        description: "Failed to submit access request. Please try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image 
              src="/Stitch Please Ish Black.png" 
              alt="Stitch Please Logo" 
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
            <p className="text-gray-600">
              Your access request has been sent to the administrators. You will be notified via email when it is reviewed.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ email: "", name: "", reason: "" });
              }}
              className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-3 font-semibold rounded-xl"
            >
              Submit Another Request
            </Button>
            
            <Button
              onClick={() => window.location.href = '/admin'}
              variant="outline"
              className="w-full py-3 rounded-xl"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <Image 
              src="/Stitch Please Ish Black.png" 
              alt="Stitch Please Logo" 
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Admin Access</h1>
          <p className="text-lg text-gray-500">
            Your email is not authorized to access the admin panel. Please request access below.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-base font-medium text-gray-900 mb-3">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
              placeholder="your.email@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-900 mb-3">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200"
              placeholder="Your full name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-base font-medium text-gray-900 mb-3">
              Reason for Access
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#74CADC] focus:border-[#74CADC] transition-all duration-200 resize-none"
              placeholder="Please explain why you need access to the admin panel..."
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting Request..." : "Submit Access Request"}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button
            onClick={() => window.location.href = '/admin'}
            variant="outline"
            className="w-full py-3 rounded-xl"
          >
            Back to Login
          </Button>
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure access request system</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Mail, Facebook, Instagram, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/lib/toast-context";

interface NewsletterSectionProps {
  variant?: "default" | "gradient";
  showPhone?: boolean;
}

export function NewsletterSection({ variant = "default", showPhone = false }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addToast({
        title: "Email Required",
        description: "Please enter your email address",
        type: "error"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json() as { success?: boolean; message?: string; error?: string };

      if (response.ok) {
        addToast({
          title: "Successfully Subscribed!",
          description: "Check your email for confirmation. Thank you for joining our community!",
          type: "success"
        });
        setEmail(""); // Clear the input
      } else {
        addToast({
          title: "Subscription Failed",
          description: data.error || data.message || "Something went wrong. Please try again later.",
          type: "error"
        });
      }
    } catch (error) {
      addToast({
        title: "Network Error",
        description: "Unable to connect. Please check your connection and try again.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionClassName = variant === "gradient" 
    ? "px-[24px] lg:px-[40px] py-[80px] bg-gradient-to-br from-[#74CADC]/5 via-transparent to-[#74CADC]/10"
    : "px-[24px] lg:px-[40px] py-[80px]";

  const inputClassName = variant === "gradient"
    ? "flex-1 px-[24px] py-[14px] bg-white/80 backdrop-blur-sm rounded-md text-[14px] leading-[130%] placeholder:text-black/[0.44] focus:outline-none focus:bg-white transition-all duration-[0.25s] border border-black/[0.06]"
    : "flex-1 px-[24px] py-[14px] bg-black/[0.03] rounded-md text-[14px] leading-[130%] placeholder:text-black/[0.44] focus:outline-none focus:bg-black/[0.06] transition-all duration-[0.25s] disabled:opacity-50 disabled:cursor-not-allowed";

  const socialButtonClassName = variant === "gradient"
    ? "w-[48px] h-[48px] rounded-full bg-white/80 backdrop-blur-sm hover:bg-[#74CADC] flex items-center justify-center transition-all duration-[0.25s] group border border-black/[0.06]"
    : "w-[48px] h-[48px] rounded-full bg-black/[0.03] hover:bg-[#74CADC] flex items-center justify-center group";

  return (
    <section className={sectionClassName}>
      <div className="max-w-[600px] mx-auto">
        <div className="text-center mb-[40px]">
          <h3 className="text-[24px] lg:text-[32px] leading-[130%] font-bold text-black/[0.72]">
            Stay Connected
          </h3>
          <p className="text-[14px] lg:text-[16px] leading-[130%] text-black/[0.44] mt-[8px]">
            Get the latest updates and join our community
          </p>
        </div>

        {/* Email Form - NEO Style */}
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-[12px] mb-[32px]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={isSubmitting}
            className={inputClassName}
            suppressHydrationWarning
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto px-[24px] py-[14px] bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565] transition-all duration-[0.25s] flex items-center justify-center gap-[8px] group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-[14px] leading-[130%] font-medium">
              {isSubmitting ? "Subscribing..." : "Subscribe"}
            </span>
            <Mail className="h-[16px] w-[16px] group-hover:scale-110 transition-transform" />
          </Button>
        </form>

        {/* Social Links - NEO Style */}
        <div className="flex justify-center gap-[16px]">
          <Button
            onClick={() => window.open("https://www.facebook.com/stitchpleaseqc", "_blank")}
            className={socialButtonClassName}
            variant="ghost"
            aria-label="Facebook"
          >
            <Facebook className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-[#0A5565] transition-colors" />
          </Button>
          <Button
            onClick={() => window.open("https://www.instagram.com/stitchpleaseqc", "_blank")}
            className={socialButtonClassName}
            variant="ghost"
            aria-label="Instagram"
          >
            <Instagram className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-[#0A5565] transition-colors" />
          </Button>
          {showPhone && (
            <Button
              onClick={() => window.open("tel:3093736017", "_blank")}
              className={socialButtonClassName}
              variant="ghost"
              aria-label="Phone"
            >
              <Phone className="h-[20px] w-[20px] text-black/[0.72] group-hover:text-[#0A5565] transition-colors" />
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}


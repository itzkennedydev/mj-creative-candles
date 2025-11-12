"use client";

import React from 'react';
import { Facebook, Instagram, Phone } from "lucide-react";
import { Button } from "~/components/ui/button";

interface NewsletterSectionProps {
  variant?: "default" | "gradient";
  showPhone?: boolean;
}

export function NewsletterSection({ variant = "default", showPhone = false }: NewsletterSectionProps) {

  const sectionClassName = variant === "gradient" 
    ? "px-[24px] lg:px-[40px] py-[80px] bg-gradient-to-br from-[#74CADC]/5 via-transparent to-[#74CADC]/10"
    : "px-[24px] lg:px-[40px] py-[80px]";

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
            Follow us on social media
          </p>
        </div>

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


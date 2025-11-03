"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCart } from "~/lib/cart-context";
import { useState, useEffect } from "react";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";

export function Header() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const itemCount = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  const handleCartClick = () => {
    if (itemCount > 0) {
      router.push('/shop/checkout');
    }
  };

  return (
    <>
      {/* Header with NEO styling */}
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
      >
        <Container>
          <div className="flex items-center justify-between py-3">
            {/* Logo - Left aligned */}
            <Link 
              href="/" 
              className="flex items-center group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="relative overflow-hidden" style={{ height: "60px" }}>
                <Image
                  src="/Stitch Please Ish Black.png"
                  alt="Stitch Please"
                  width={240}
                  height={60}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  style={{ width: "auto", height: "60px" }}
                  priority
                  sizes="(max-width: 768px) 180px, 240px"
                />
              </div>
            </Link>

            {/* Desktop Navigation - Center */}
            <nav className="hidden lg:flex items-center gap-[32px] absolute left-1/2 transform -translate-x-1/2">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/events/stitch-sniff-holiday">Events</NavLink>
              <NavLink href="/appointments" badge="NEW">Mobile</NavLink>
              <NavLink href="/about">About</NavLink>
            </nav>

            {/* Right Section - Cart & Menu */}
            <div className="flex items-center gap-[16px]">
              {/* Cart Button - NEO Style */}
              <button
                onClick={handleCartClick}
                className="relative p-[8px] hover:bg-black/[0.03] rounded-full transition-all duration-[0.25s]"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-[20px] w-[20px] text-black/[0.72]" />
                {itemCount > 0 && (
                  <span className="absolute -top-[4px] -right-[4px] bg-[#74CADC] text-[#0A5565] text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-[6px] shadow-sm border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-[8px] hover:bg-black/[0.03] rounded-full transition-all duration-[0.25s]"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-[20px] w-[20px] text-black/[0.72]" />
                ) : (
                  <Menu className="h-[20px] w-[20px] text-black/[0.72]" />
                )}
              </button>

              {/* Desktop Order Button */}
              <Link href="/shop">
                <Button className="hidden lg:flex bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        {/* Mobile Menu - NEO Style Overlay */}
        <div 
          className={`lg:hidden fixed inset-0 top-[60px] bg-white z-[99] transition-all duration-300 ${
            mobileMenuOpen 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <Container>
            <nav className="py-[40px] flex flex-col gap-[8px]">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/shop" onClick={() => setMobileMenuOpen(false)}>
                Shop
              </MobileNavLink>
              <MobileNavLink href="/services" onClick={() => setMobileMenuOpen(false)}>
                Services
              </MobileNavLink>
              <MobileNavLink href="/events/stitch-sniff-holiday" onClick={() => setMobileMenuOpen(false)}>
                Events
              </MobileNavLink>
              <MobileNavLink href="/appointments" badge="NEW" onClick={() => setMobileMenuOpen(false)}>
                Mobile Embroidery
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setMobileMenuOpen(false)}>
                About
              </MobileNavLink>
              
              {/* Mobile CTA Button */}
              <div className="mt-[32px] pt-[32px] border-t border-black/[0.06]">
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#74CADC] hover:bg-[#74CADC]/90 text-[#0A5565]">
                    Start Shopping
                  </Button>
                </Link>
                
                {/* Cart Summary for Mobile */}
                {itemCount > 0 && (
                  <Link href="/shop/checkout" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-[12px] bg-[#74CADC]/10 hover:bg-[#74CADC]/20 text-black/[0.72]" variant="outline">
                      <ShoppingCart className="h-[16px] w-[16px]" />
                      <span>View Cart ({itemCount} items)</span>
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </Container>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[84px]" />
    </>
  );
}

// Desktop Navigation Link Component
function NavLink({ 
  href, 
  children, 
  badge 
}: { 
  href: string; 
  children: React.ReactNode; 
  badge?: string;
}) {
  return (
    <Link 
      href={href}
      className="relative text-[14px] leading-[130%] text-black/[0.72] hover:text-black transition-colors duration-[0.25s] font-medium group inline-flex items-center gap-[8px]"
    >
      <span className="relative">
        {children}
        {/* Hover underline effect */}
        <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-black/[0.72] scale-x-0 group-hover:scale-x-100 transition-transform duration-[0.25s] origin-center" />
      </span>
      {badge && (
        <span className="bg-[#74CADC] text-[#0A5565] text-[10px] font-bold px-[8px] py-[4px] rounded-full whitespace-nowrap flex-shrink-0 shadow-sm border border-[#74CADC]/20">
          {badge}
        </span>
      )}
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({ 
  href, 
  children, 
  badge,
  onClick 
}: { 
  href: string; 
  children: React.ReactNode; 
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className="px-[24px] py-[16px] bg-black/[0.03] hover:bg-black/[0.06] rounded-[20px] text-[16px] leading-[130%] text-black/[0.72] hover:text-black transition-all duration-[0.25s] font-medium flex items-center justify-between group"
    >
      <span className="flex items-center gap-[12px]">
        {children}
      </span>
      {badge ? (
        <span className="bg-[#74CADC] text-[#0A5565] text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap flex-shrink-0 shadow-sm border border-[#74CADC]/20">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
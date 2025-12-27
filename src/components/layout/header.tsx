"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart, X, ChevronDown } from "lucide-react";
import { useCart } from "~/lib/cart-context";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Container } from "~/components/ui/container";
import { Button } from "~/components/ui/button";
import { IMAGE_URLS } from "~/lib/image-config";

function HeaderComponent() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const itemCount = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isFaqMenuOpen, setIsFaqMenuOpen] = useState(false);
  const [shopMenuTimeout, setShopMenuTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const [faqMenuTimeout, setFaqMenuTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Memoize shop categories since they are static
  const shopCategories = useMemo(() => [
    {
      title: "Product Categories",
      items: [
        { name: "Wax Melts", href: "/shop?category=Wax Melts" },
        { name: "Jar Candles", href: "/shop?category=Jar Candles" },
        { name: "Wax Melt Boxes", href: "/shop?category=Wax Melt Boxes" },
        { name: "Dessert Candles", href: "/shop?category=Dessert Candles" },
      ],
    },
    {
      title: "By Scent Type",
      items: [
        { name: "Citrus Scents", href: "/shop?scent=citrus" },
        { name: "Bakery Scents", href: "/shop?scent=bakery" },
        { name: "Berry Scents", href: "/shop?scent=berry" },
        { name: "Fresh Scents", href: "/shop?scent=fresh" },
        { name: "Sweet Scents", href: "/shop?scent=sweet" },
        { name: "Warm Scents", href: "/shop?scent=warm" },
      ],
    },
    {
      title: "Collections",
      items: [
        { name: "All Products", href: "/shop" },
        { name: "Featured Items", href: "/shop?featured=true" },
        { name: "On Sale", href: "/shop?sale=true" },
        { name: "New Arrivals", href: "/shop?sort=newest" },
      ],
    },
  ], []);

  // Shop menu hover handlers - memoized
  const handleShopMouseEnter = useCallback(() => {
    if (shopMenuTimeout) {
      clearTimeout(shopMenuTimeout);
    }
    setIsShopMenuOpen(true);
  }, [shopMenuTimeout]);

  const handleShopMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsShopMenuOpen(false);
    }, 200);
    setShopMenuTimeout(timeout);
  }, []);

  // FAQ menu hover handlers - memoized
  const handleFaqMouseEnter = useCallback(() => {
    if (faqMenuTimeout) {
      clearTimeout(faqMenuTimeout);
    }
    setIsFaqMenuOpen(true);
  }, [faqMenuTimeout]);

  const handleFaqMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setIsFaqMenuOpen(false);
    }, 200);
    setFaqMenuTimeout(timeout);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router]);

  const handleCartClick = useCallback(() => {
    if (itemCount > 0) {
      router.push("/shop/checkout");
    }
  }, [itemCount, router]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <>
      {/* Header with NEO styling */}
      <header
        className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "border-b border-gray-100 bg-white/95 backdrop-blur-md"
            : "bg-white"
        }`}
      >
        <Container>
          <div className="flex items-center justify-between py-3">
            {/* Logo - Left aligned */}
            <Link
              href="/"
              className="group flex items-center"
              onClick={closeMobileMenu}
            >
              <div
                className="relative overflow-hidden"
                style={{ height: "60px" }}
              >
                <Image
                  src={IMAGE_URLS.logo.main}
                  alt="MJ Creative Candles"
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
            <nav className="absolute left-1/2 hidden -translate-x-1/2 transform items-center gap-[32px] lg:flex">
              <NavLink href="/">Home</NavLink>

              {/* Shop with Mega Menu */}
              <div
                className="relative"
                onMouseEnter={handleShopMouseEnter}
                onMouseLeave={handleShopMouseLeave}
              >
                <Link
                  href="/shop"
                  className="group relative inline-flex items-center gap-[4px] text-[14px] font-medium leading-[130%] text-black/[0.72] transition-colors duration-300 hover:text-black"
                >
                  <span className="relative">
                    Shop
                    <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] origin-center scale-x-0 bg-black/[0.72] transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Link>

                {/* Mega Menu */}
                {isShopMenuOpen && (
                  <div className="absolute left-1/2 top-full z-50 mt-2 w-[800px] -translate-x-1/4 transform overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                    <div className="flex">
                      {/* Categories - Left Side */}
                      <div className="grid flex-1 grid-cols-[auto_1fr_1fr] gap-16 p-8">
                        {shopCategories.map((category, index) => (
                          <div
                            key={index}
                            className={`flex w-fit flex-col items-start ${index === 0 ? 'pr-0.5' : ''}`}
                          >
                            <h3 className="mb-4 whitespace-nowrap text-left text-sm font-semibold uppercase tracking-wide text-gray-900">
                              {category.title}
                            </h3>
                            <ul className="w-full space-y-3 text-left">
                              {category.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="w-full">
                                  <Link
                                    href={item.href}
                                    className="block w-full text-left text-sm text-gray-600 transition-colors hover:text-gray-900"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Featured Product - Right Side */}
                      <div className="relative m-0 w-64 overflow-hidden rounded-r-2xl border-l border-gray-100 p-0">
                        <div className="relative h-full w-full">
                          <Image
                            src="/images/featured/F1.png"
                            alt="Featured Product"
                            fill
                            className="object-cover"
                            style={{
                              objectPosition: "center center",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 p-4">
                            <div className="text-center text-white">
                              <h4 className="text-sm font-semibold">
                                Featured Collection
                              </h4>
                              <p className="text-xs opacity-90">
                                Discover our signature scents
                              </p>
                              <Link
                                href="/shop?featured=true"
                                className="text-xs font-medium text-white hover:underline"
                              >
                                Shop Now →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/track-order">Track Order</NavLink>
              <NavLink href="/about">About</NavLink>

              {/* FAQ with Submenu */}
              <div
                className="relative"
                onMouseEnter={handleFaqMouseEnter}
                onMouseLeave={handleFaqMouseLeave}
              >
                <Link
                  href="/faq"
                  className="group relative inline-flex items-center gap-[4px] text-[14px] font-medium leading-[130%] text-black/[0.72] transition-colors duration-300 hover:text-black"
                >
                  <span className="relative">
                    FAQ
                    <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] origin-center scale-x-0 bg-black/[0.72] transition-transform duration-300 group-hover:scale-x-100" />
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Link>

                {/* FAQ Dropdown */}
                {isFaqMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="py-2">
                      <Link
                        href="/faq"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        FAQs
                      </Link>
                      <Link
                        href="/candle-care"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Candle Care
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink href="/contact">Contact</NavLink>
            </nav>

            {/* Right Section - Cart & Menu */}
            <div className="flex items-center gap-[16px]">
              {/* Cart Button - NEO Style */}
              <button
                onClick={handleCartClick}
                className="relative rounded-full p-[8px] transition-all duration-300 hover:bg-black/[0.03]"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-[20px] w-[20px] text-black/[0.72]" />
                {itemCount > 0 && (
                  <span className="absolute -right-[4px] -top-[4px] flex h-[20px] min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-[#1d1d1f] px-[6px] text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="rounded-full p-[8px] transition-all duration-300 hover:bg-black/[0.03] lg:hidden"
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
                <Button variant="primary" className="hidden lg:flex">
                  Order Now
                </Button>
              </Link>
            </div>
          </div>
        </Container>

        {/* Mobile Menu - NEO Style Overlay */}
        <div
          className={`fixed inset-0 top-[60px] z-[99] bg-white transition-all duration-300 lg:hidden ${
            mobileMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <Container>
            <nav className="flex flex-col gap-[8px] py-[40px]">
              <MobileNavLink href="/" onClick={closeMobileMenu}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/shop" onClick={closeMobileMenu}>
                Shop
              </MobileNavLink>
              <MobileNavLink href="/track-order" onClick={closeMobileMenu}>
                Track Order
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={closeMobileMenu}>
                About
              </MobileNavLink>
              <MobileNavLink href="/faq" onClick={closeMobileMenu}>
                FAQ
              </MobileNavLink>
              <MobileNavLink href="/candle-care" onClick={closeMobileMenu}>
                Candle Care
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={closeMobileMenu}>
                Contact
              </MobileNavLink>

              {/* Mobile CTA Button */}
              <div className="mt-[32px] border-t border-black/[0.06] pt-[32px]">
                <Link href="/shop" onClick={closeMobileMenu}>
                  <Button className="w-full rounded-xl bg-[#1d1d1f] font-medium text-white hover:bg-[#0a0a0a]">
                    Start Shopping
                  </Button>
                </Link>

                {/* Cart Summary for Mobile */}
                {itemCount > 0 && (
                  <Link href="/shop/checkout" onClick={closeMobileMenu}>
                    <Button
                      className="mt-[12px] w-full bg-[#737373]/10 text-black/[0.72] hover:bg-[#737373]/20"
                      variant="outline"
                    >
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
  badge,
}: {
  href: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex items-center gap-[8px] text-[14px] font-medium leading-[130%] text-black/[0.72] transition-colors duration-300 hover:text-black"
    >
      <span className="relative">
        {children}
        {/* Hover underline effect */}
        <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] origin-center scale-x-0 bg-black/[0.72] transition-transform duration-300 group-hover:scale-x-100" />
      </span>
      {badge && (
        <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-[#1d1d1f] px-[8px] py-[4px] text-[10px] font-bold text-white">
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
  onClick,
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
      className="group flex items-center justify-between rounded-[20px] bg-black/[0.03] px-[24px] py-[16px] text-[16px] font-medium leading-[130%] text-black/[0.72] transition-all duration-300 hover:bg-black/[0.06] hover:text-black"
    >
      <span className="flex items-center gap-[12px]">{children}</span>
      {badge ? (
        <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-[#1d1d1f] px-[10px] py-[4px] text-[11px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

// Memoize Header to prevent unnecessary re-renders
export const Header = memo(HeaderComponent);

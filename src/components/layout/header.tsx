"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Menu, ShoppingCart } from "lucide-react";
import { Container } from "~/components/ui/container";
import { NotificationBar } from "./notification-bar";
import { useCart } from "~/lib/cart-context";

export function Header() {
  const { getTotalItems } = useCart();
  const router = useRouter();
  const itemCount = getTotalItems();

  const handleCartClick = () => {
    if (itemCount > 0) {
      router.push('/shop/checkout');
    }
  };

  return (
    <>
      <NotificationBar />
      <header className="pt-4 md:pt-8">
        <Container className="min-h-[64px] py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/Stitch Please Ish Black.png"
              alt="Stitch Please Logo"
              width="120"
              height="30"
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/Feeling Stitch Please Ish White.png"
              alt="Stitch Please Logo"
              width="120"
              height="30"
              className="object-contain hidden dark:block"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-lg font-medium hover:text-primary/80 px-4 py-4">
              Home
            </Link>

 
            <Link href="/shop" className="text-lg font-medium hover:text-primary/80 px-4 py-4">
              Shop
            </Link>

            <Link href="/services" className="text-lg font-medium hover:text-primary/80 px-4 py-4">
              Services
            </Link>

            <Link href="/appointments" className="text-lg font-medium hover:text-primary/80 flex items-center gap-2 px-4 py-4">
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">New</span>
              Mobile Embroidery
            </Link>

            <Link href="/about" className="text-lg font-medium hover:text-primary/80 px-4 py-4">
              About Us
            </Link>
          </nav>

          {/* Cart Icon (Desktop) */}
          <div className="hidden md:flex items-center">
            <Button
              variant="ghost"
              className="relative text-[#0A5565] hover:text-[#0A5565]/90 p-2 h-10 w-10 [&_svg]:!size-6"
              onClick={handleCartClick}
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px]">
              <SheetHeader>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-xl font-medium hover:text-primary/80 px-4 py-4">
                  Home
                </Link>

                <Link href="/shop" className="text-xl font-medium hover:text-primary/80 px-4 py-4">
                  Shop
                </Link>

                <Link href="/services" className="text-xl font-medium hover:text-primary/80 px-4 py-4">
                  Services
                </Link>

                <Link href="/appointments" className="text-xl font-medium hover:text-primary/80 px-4 py-4 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-sm font-medium">New</span>
                  Mobile Embroidery
                </Link>
                
                <Link href="/about" className="text-xl font-medium hover:text-primary/80 px-4 py-4">
                  About Us
                </Link>

                <div className="flex items-center justify-center mt-8 pt-8 border-t">
                  <Button
                    variant="ghost"
                    className="relative text-[#0A5565] hover:text-[#0A5565]/90 p-2 h-10 w-10 [&_svg]:!size-6"
                    onClick={handleCartClick}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                  <span className="ml-4 text-lg font-medium text-[#0A5565]">Cart ({itemCount})</span>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </Container>
      </header>
    </>
  );
}
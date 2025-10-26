import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/ui/container";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  services: [
    { label: "Custom Stitching", href: "/services" },
    { label: "Repairs", href: "/services/repairs" },
    { label: "Consultations", href: "/services/consultations" },
  ],
};

// Business hours
const businessHours = [
  { day: "Monday", hours: "10am - 4:30pm" },
  { day: "Tuesday", hours: "10am - 4:30pm" },
  { day: "Wednesday", hours: "Closed" },
  { day: "Thursday", hours: "10am - 4:30pm" },
  { day: "Friday", hours: "10am - 4:30pm" },
  { day: "Saturday", hours: "every other Saturday 10am - 2pm" },
  { day: "Sunday", hours: "Closed" },
];

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <Link href="/" className="block">
                <Image
                  src="/Stitch Please Ish Black.png"
                  alt="Stitch Please Logo"
                  width={100}
                  height={33}
                  className="h-auto w-auto dark:hidden"
                />
                <Image
                  src="/Feeling Stitch Please Ish White.png"
                  alt="Stitch Please Logo"
                  width={100}
                  height={33}
                  className="h-auto w-auto hidden dark:block"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                Your trusted partner for all your stitching needs. Quality craftsmanship and attention to detail.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold mb-4">Contact Us</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Email: pleasestitch18@gmail.com</p>
                <p>Phone: (309) 373-6017</p>
                <p>Address: 415 13th St</p>
                <p>Moline, IL 61265</p>
              </div>
            </div>
            
            {/* Business Hours */}
            <div>
              <h3 className="font-semibold mb-4">Business Hours</h3>
              <div className="grid grid-cols-2 gap-x-2 text-sm text-muted-foreground">
                {businessHours.map((item, index) => (
                  <React.Fragment key={index}>
                    <p className="font-medium">{item.day}:</p>
                    <p>{item.hours}</p>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Stitch Please. All rights reserved. Crafted with ❤️ by{" "}
              <a 
                href="https://www.sovereigncreative.agency"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Sovereign Creative Agency
              </a>
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
} 
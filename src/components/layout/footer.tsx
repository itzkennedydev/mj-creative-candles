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

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="space-y-4">
              <Link href="/" className="block">
                <Image
                  src="/Logo.png"
                  alt="Stitch Please Logo"
                  width={100}
                  height={33}
                  className="h-auto w-auto"
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
                <p>Email: info@stitchplease.com</p>
                <p>Phone: (555) 123-4567</p>
                <p>Address: 123 Stitch Street</p>
                <p>City, State 12345</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Stitch Please. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
} 
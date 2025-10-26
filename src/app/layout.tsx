import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { ProductsProvider } from "~/lib/products-context";
import { CartProvider } from "~/lib/cart-context";
import { ToastProvider } from "~/lib/toast-context";
import { ToastContainer } from "~/components/ui/toast";
import QueryProvider from "~/lib/query-client";
import Script from "next/script";
import { ConditionalLayout } from "../components/layout/conditional-layout";

export const metadata: Metadata = {
  title: "Stitch, Please! | Custom Embroidery & Design Services",
  description: "Professional custom embroidery, signs, team apparel, business logos, and personalized items by Tanika Zentic. Fast turnaround times and creative designs for all your custom needs.",
  metadataBase: new URL('https://stitchpleaseqc.com'),
  keywords: ['custom embroidery', 'wooden signs', 'canvas signs', 'team apparel', 'business logos', 'personalized gifts', 'custom designs', 'quad cities'],
  authors: [{ name: 'Tanika Zentic' }],
  openGraph: {
    title: 'Stitch, Please! | Custom Embroidery & Design Services',
    description: 'Professional custom embroidery, signs, apparel and personalized items in the Quad Cities. Fast turnaround times and creative designs.',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stitch, Please! Custom Embroidery',
    description: 'Professional custom embroidery and design services by Tanika Zentic.',
    images: ['/twitter-image.jpg'],
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" }
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <QueryProvider>
          <ProductsProvider>
            <CartProvider>
              <ToastProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <ToastContainer />
              </ToastProvider>
            </CartProvider>
          </ProductsProvider>
        </QueryProvider>
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

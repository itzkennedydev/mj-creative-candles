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
import { generateSEOTags } from "~/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "./sca-dashboard/components/ui/tooltip";

export const metadata: Metadata = generateSEOTags({
  title: "Stitch, Please! | Custom Embroidery & Design Services",
  description: "Professional custom embroidery, signs, team apparel, business logos, and personalized items by Tanika Zentic. Fast turnaround times and creative designs for all your custom needs.",
  url: "https://stitchpleaseqc.com",
  keywords: ['custom embroidery', 'wooden signs', 'canvas signs', 'team apparel', 'business logos', 'personalized gifts', 'custom designs', 'quad cities'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0A5565" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect to external domains for faster loads */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Prefetch critical pages */}
        <link rel="prefetch" href="/shop" as="document" />
        
        {/* Google Analytics - load after page is interactive */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        <QueryProvider>
          <ProductsProvider>
            <CartProvider>
              <ToastProvider>
                <TooltipProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <ToastContainer />
                </TooltipProvider>
              </ToastProvider>
            </CartProvider>
          </ProductsProvider>
        </QueryProvider>
        <Script
          src="https://www.instagram.com/embed.js"
          strategy="lazyOnload"
        />
        <Analytics />
      </body>
    </html>
  );
}

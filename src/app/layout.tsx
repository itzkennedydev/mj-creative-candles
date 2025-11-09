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
        <meta name="theme-color" content="#74CADC" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
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
        <Analytics />
      </body>
    </html>
  );
}

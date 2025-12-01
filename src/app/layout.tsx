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
import { generateSEOTags, generateLocalBusinessSchema, generateWebsiteSchema, generateFAQSchema } from "~/lib/seo";
import { Analytics } from "@vercel/analytics/next";
import { TooltipProvider } from "./sca-dashboard/components/ui/tooltip";

export const metadata: Metadata = generateSEOTags({
  title: "Stitch Please | Custom Embroidery & Spirit Wear | Quad Cities, IL",
  description: "Premium custom embroidery in Moline, IL serving the Quad Cities. Custom beanies, hoodies, t-shirts, school spirit wear for Moline Maroons, Rock Island Rocks, UTHS Panthers. Fast 5-7 day turnaround. Local pickup available. Call (309) 373-6017",
  url: "https://stitchpleaseqc.com",
  keywords: [
    'custom embroidery Quad Cities', 'embroidery Moline IL', 'custom apparel Davenport',
    'spirit wear Rock Island', 'UTHS Panthers gear', 'Moline Maroons spirit wear',
    'custom beanies Illinois', 'personalized hoodies Iowa', 'team apparel Quad Cities',
    'school spirit wear', 'custom t-shirts Bettendorf', 'embroidery near me',
    'mama keepsake sweatshirt', 'baby clothes keepsake', 'Elite Volleyball apparel',
    'Wildcats spirit wear', 'corporate embroidery', 'business logos embroidery'
  ],
});

// JSON-LD structured data for local business
const localBusinessSchema = generateLocalBusinessSchema();
const websiteSchema = generateWebsiteSchema();

// Homepage FAQ schema for rich snippets
const homepageFaqs = [
  {
    question: "Where is Stitch Please located in the Quad Cities?",
    answer: "Stitch Please is located at 415 13th St, Moline, IL 61265. We're conveniently located in downtown Moline, serving customers from Rock Island, Davenport, Bettendorf, East Moline, and the entire Quad Cities area."
  },
  {
    question: "What custom embroidery services do you offer?",
    answer: "We offer professional custom embroidery on apparel including t-shirts, hoodies, crewnecks, polos, hats, beanies, jackets, and bags. We specialize in school spirit wear, team uniforms, corporate apparel, personalized gifts, and our signature Mama Keepsake Sweatshirts made from baby clothes."
  },
  {
    question: "How long does custom embroidery take?",
    answer: "Our typical turnaround time is 5-7 business days. Rush orders may be available for an additional fee. Contact us at (309) 373-6017 to discuss your timeline."
  },
  {
    question: "Do you create spirit wear for local schools?",
    answer: "Yes! We create custom spirit wear for Quad Cities schools including Moline Maroons, Rock Island Rocks, UTHS Panthers (United Township), Davenport North Wildcats, and many more. We can create custom designs for any school, team, or organization."
  },
  {
    question: "What is a Mama Keepsake Sweatshirt?",
    answer: "Our Mama Keepsake Sweatshirt transforms your baby's clothes into a beautiful, wearable memory. Bring in your baby's onesies, sleepers, or favorite outfits, and we'll create a custom MAMA appliqué sweatshirt using the fabric from those precious items."
  },
  {
    question: "Do you offer pickup or shipping?",
    answer: "We currently offer local pickup at our Moline, IL location. This allows us to ensure your order is perfect before you take it home and keeps our prices competitive."
  },
  {
    question: "How do I contact Stitch Please?",
    answer: "You can reach us by phone at (309) 373-6017, by email at tanika@stitchpleaseqc.com, or visit us at 415 13th St, Moline, IL 61265. Our hours are Monday, Tuesday, and Friday from 1-3 PM."
  }
];
const faqSchema = generateFAQSchema(homepageFaqs);

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
        
        {/* Local Business Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        
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

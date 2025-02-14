import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Header } from "~/components/layout/header";

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
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}

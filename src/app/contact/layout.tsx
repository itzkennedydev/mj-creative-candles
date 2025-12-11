import { type Metadata } from "next";
import { generateSEOTags } from "~/lib/seo";

export const metadata: Metadata = generateSEOTags({
  title: "Contact Us | MJ Creative Candles Embroidery | Moline, IL",
  description: "Contact MJ Creative Candles for handcrafted candles in the Quad Cities. Visit us at 415 13th St, Moline, IL 61265. Call (309) 373-6017 or email tanika@mjcreativecandles.com. Open Mon, Tue, Fri 1-3 PM.",
  url: "https://stitchpleaseqc.com/contact",
  keywords: [
    'contact MJ Creative Candles', 'candle shop Moline IL', 'Quad Cities embroidery contact',
    '309-373-6017', '415 13th St Moline', 'handcrafted candles phone number',
    'candle shop hours', 'Moline business contact', 'Quad Cities custom apparel'
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


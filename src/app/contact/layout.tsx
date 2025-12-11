import { type Metadata } from "next";
import { generateSEOTags } from "~/lib/seo";

export const metadata: Metadata = generateSEOTags({
  title: "Contact Us | MJ Creative Candles | Moline, IL",
  description:
    "Contact MJ Creative Candles for custom gifts and candles in the Quad Cities. Visit us at 415 13th St, Moline, IL 61265. Call (309) 373-6017 or email mjcreativecandles@gmail.com.",
  url: "https://mjcreativecandles.com/contact",
  keywords: [
    "contact MJ Creative Candles",
    "candle shop Moline IL",
    "Quad Cities custom gifts contact",
    "309-373-6017",
    "415 13th St Moline",
    "candle shop phone number",
    "candle shop hours",
    "Moline business contact",
    "Quad Cities custom candles",
  ],
});

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

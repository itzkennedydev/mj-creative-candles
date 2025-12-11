import { type Metadata } from "next";
import { generateSEOTags, generateFAQSchema } from "~/lib/seo";

const faqs = [
  {
    question: "Where is MJ Creative Candles located?",
    answer:
      "We are located at 415 13th St, Moline, IL 61265 in the heart of the Quad Cities. We serve customers from Moline, Rock Island, Davenport, Bettendorf, East Moline, and surrounding areas.",
  },
  {
    question: "How long does it take to create custom candles?",
    answer:
      "Our typical turnaround time is 5-7 business days for custom orders. Rush orders may be available - contact us at (309) 373-6017 for rush order availability.",
  },
  {
    question: "What types of candles do you offer?",
    answer:
      "We offer handcrafted soy candles in various sizes and scents. We also create custom candles with personalized labels and unique scent combinations tailored to your preferences.",
  },
  {
    question: "Do you offer gift sets?",
    answer:
      "Yes! We create beautiful candle gift sets perfect for any occasion. We can customize the scents, packaging, and labels to make your gift extra special.",
  },
];

export const metadata: Metadata = generateSEOTags({
  title: "About Us | Handcrafted Candle Shop in Moline, IL",
  description:
    "Learn about MJ Creative Candles, the Quad Cities' premier handcrafted candle shop. Owner Tanika Zentic brings 10+ years of experience creating personalized candles and custom scents. Located at 415 13th St, Moline, IL.",
  url: "https://mjcreativecandles.com/about",
  keywords: [
    "about MJ Creative Candles",
    "Moline candle shop",
    "Tanika Zentic",
    "Quad Cities candles",
    "custom candle business",
    "local candle shop",
    "women-owned business Quad Cities",
    "handcrafted candles Moline IL",
    "artisan candles Quad Cities",
    "personalized gifts shop",
  ],
});

// FAQ Schema for the about page
const faqSchema = generateFAQSchema(faqs);

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}

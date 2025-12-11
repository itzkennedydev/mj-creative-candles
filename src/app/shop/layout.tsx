import { type Metadata } from "next";
import { generateSEOTags } from "~/lib/seo";

export const metadata: Metadata = generateSEOTags({
  title: "Shop Custom Embroidery & Spirit Wear | Quad Cities",
  description: "Shop custom embroidered beanies, hoodies, t-shirts, and school spirit wear. Moline Maroons, Rock Island Rocks, UTHS Panthers, and more. 15% off with code STITCHIT. Fast turnaround, local pickup in Moline, IL.",
  url: "https://mjcreativecandles.com/shop",
  keywords: [
    'buy custom embroidery', 'shop spirit wear Quad Cities', 'custom beanies for sale',
    'embroidered hoodies Moline', 'school spirit wear shop', 'Moline Maroons apparel',
    'Rock Island Rocks gear', 'UTHS Panthers merchandise', 'custom t-shirts Davenport',
    'team apparel Bettendorf', 'personalized gifts Quad Cities', 'embroidery shop near me'
  ],
});

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

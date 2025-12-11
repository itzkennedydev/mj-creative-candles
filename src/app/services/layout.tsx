import { type Metadata } from "next";
import { generateSEOTags, generateFAQSchema } from "~/lib/seo";

const servicesFaqs = [
  {
    question: "What embroidery services do you offer?",
    answer: "We offer custom embroidery on apparel including t-shirts, hoodies, crewnecks, polos, hats, beanies, jackets, and bags. We also specialize in school spirit wear, team uniforms, corporate apparel, and personalized gifts."
  },
  {
    question: "Can you embroider my own garments?",
    answer: "Yes! You can bring in your own items for embroidery. We can add names, logos, monograms, and custom designs to most fabric items. Contact us to discuss your specific project."
  },
  {
    question: "Do you offer bulk or wholesale pricing?",
    answer: "Yes, we offer competitive pricing for bulk orders. Contact us for a custom quote on orders of 12+ items for teams, businesses, events, or organizations."
  },
  {
    question: "What file formats do you accept for logos?",
    answer: "We accept most image formats including PNG, JPG, AI, EPS, and PDF. High-resolution files work best. We can also recreate logos from photos or sketches for an additional digitizing fee."
  }
];

export const metadata: Metadata = generateSEOTags({
  title: "Embroidery Services | Custom Apparel & Spirit Wear | Quad Cities",
  description: "Professional custom embroidery services in Moline, IL. T-shirts, hoodies, hats, beanies, team uniforms, corporate apparel, and personalized gifts. Serving the Quad Cities: Moline, Rock Island, Davenport, Bettendorf. Call (309) 373-6017.",
  url: "https://mjcreativecandles.com/services",
  keywords: [
    'embroidery services Quad Cities', 'custom embroidery Moline', 'apparel embroidery Davenport',
    'logo embroidery Rock Island', 'team uniform embroidery', 'corporate embroidery services',
    'hat embroidery Bettendorf', 'hoodie embroidery Illinois', 't-shirt embroidery Iowa',
    'custom stitching services', 'monogram embroidery', 'name embroidery Quad Cities'
  ],
});

const faqSchema = generateFAQSchema(servicesFaqs);

export default function ServicesLayout({
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


import { type Metadata } from "next";
import { generateSEOTags, generateFAQSchema } from "~/lib/seo";

const faqs = [
  {
    question: "Where is Stitch Please located?",
    answer: "We are located at 415 13th St, Moline, IL 61265 in the heart of the Quad Cities. We serve customers from Moline, Rock Island, Davenport, Bettendorf, East Moline, and surrounding areas."
  },
  {
    question: "How long does custom embroidery take?",
    answer: "Our typical turnaround time is 5-7 business days. Rush orders may be available - contact us at (309) 373-6017 for rush order availability."
  },
  {
    question: "Do you offer school spirit wear?",
    answer: "Yes! We create custom spirit wear for local schools including Moline Maroons, Rock Island Rocks, UTHS Panthers, Davenport North Wildcats, and more. We can also create custom designs for any team or organization."
  },
  {
    question: "What is the Mama Keepsake Sweatshirt?",
    answer: "Our Mama Keepsake Sweatshirt transforms your baby's clothes into a beautiful, wearable memory. Bring in your baby's onesies, sleepers, or outfits, and we'll create a custom MAMA appliqué sweatshirt using the fabric."
  }
];

export const metadata: Metadata = generateSEOTags({
  title: "About Us | Custom Embroidery Shop in Moline, IL",
  description: "Learn about Stitch Please, the Quad Cities' premier custom embroidery shop. Owner Tanika Zentic brings 10+ years of experience creating personalized apparel, spirit wear, and keepsake items. Located at 415 13th St, Moline, IL.",
  url: "https://stitchpleaseqc.com/about",
  keywords: [
    'about Stitch Please', 'Moline embroidery shop', 'Tanika Zentic', 'Quad Cities embroidery',
    'custom apparel business', 'local embroidery shop', 'women-owned business Quad Cities',
    'embroidery services Moline IL', 'custom stitching Quad Cities', 'personalized gifts shop'
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


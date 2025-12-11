"use client";

import { useState } from "react";
import { Container } from "~/components/ui/container";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const faqs = [
    {
      id: 1,
      category: "General",
      question: "What makes your candles special?",
      answer:
        "Our candles are hand-poured in small batches using premium soy wax and the finest fragrance oils. Each candle is cured for 2 to 3 weeks to ensure the strongest, most delicious scents. We use cotton wicks and natural materials for a clean, eco-friendly burn.",
    },
    {
      id: 2,
      category: "General",
      question: "How long do your candles burn?",
      answer:
        "Burn times vary by size: 6 oz candles burn for 30 to 40 hours, 8 oz candles for 40 to 50 hours, and 10 oz candles for 50 to 60 hours. These times are based on proper burning practices (trimming wicks, allowing full melt pool, etc.).",
    },
    {
      id: 3,
      category: "Shipping",
      question: "How long does shipping take?",
      answer:
        "We typically process orders within 1 to 2 business days. Standard shipping takes 3 to 5 business days, while expedited shipping takes 1 to 2 business days. During peak seasons, processing may take slightly longer.",
    },
    {
      id: 4,
      category: "Shipping",
      question: "Do you ship internationally?",
      answer:
        "Currently, we only ship within the United States. We're working on expanding our shipping options internationally in the future.",
    },
    {
      id: 5,
      category: "Returns",
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for unused candles in their original packaging. If you're not satisfied with your purchase, contact us and we'll provide a return label. Refunds will be processed within 5 to 7 business days after we receive the returned items.",
    },
    {
      id: 6,
      category: "Returns",
      question: "Can I exchange a candle for a different scent?",
      answer:
        "Yes! We're happy to help you find the perfect scent. Contact us within 30 days of purchase, and we can arrange an exchange for a different fragrance of equal or lesser value.",
    },
    {
      id: 7,
      category: "Care",
      question: "How should I care for my candles?",
      answer:
        "For best results: trim the wick to 1/4 inch before each burn, allow the wax to melt to the edges on the first burn (2 to 4 hours), never burn for more than 4 hours at a time, and keep the wax pool free of debris. Always burn on a heat-resistant surface and never leave unattended.",
    },
    {
      id: 8,
      category: "Care",
      question: "Why is my candle tunneling?",
      answer:
        "Tunneling usually happens when the first burn wasn't long enough to create a full melt pool. To fix this, wrap the candle in aluminum foil leaving the top open, then burn for 2 to 3 hours. The foil will help distribute heat and melt the tunneled wax.",
    },
    {
      id: 9,
      category: "Products",
      question: "Are your candles safe for pets?",
      answer:
        "Our candles are made with soy wax and cotton wicks, which are generally safer than paraffin candles. However, we recommend keeping candles out of reach of pets and ensuring good ventilation. If you have concerns about specific fragrances, please contact us.",
    },
    {
      id: 10,
      category: "Products",
      question: "Do you offer custom scents or bulk orders?",
      answer:
        "Yes! We love creating custom scents for special occasions. For custom orders or bulk purchases (10+ candles), please contact us at least 2 weeks in advance. We'll work with you to create the perfect scent and discuss pricing.",
    },
  ];

  const categories = [
    "All",
    "General",
    "Shipping",
    "Returns",
    "Care",
    "Products",
  ];

  const filteredFaqs =
    selectedCategory === "All"
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-50 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="text-lg leading-relaxed text-gray-600 sm:text-xl">
              Find answers to common questions about our candles, shipping,
              returns, and more.
            </p>
          </div>
        </Container>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-gray-200 bg-white"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {faq.category}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {faq.question}
                      </h3>
                    </div>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-500" />
                    )}
                  </button>

                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-4">
                      <p className="leading-relaxed text-gray-600">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredFaqs.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-lg text-gray-500">
                  No FAQs found for this category.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}

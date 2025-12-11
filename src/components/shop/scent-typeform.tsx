"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "~/lib/cart-context";
import type { Product } from "~/lib/types";

interface Question {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: {
    id: string;
    text: string;
    value: string;
  }[];
}

interface ScentTypeformProps {
  isOpen: boolean;
  onClose: () => void;
}

const questions: Question[] = [
  {
    id: "mood",
    question: "What mood are you looking to create?",
    type: "single",
    options: [
      { id: "relaxing", text: "Relaxing & Calming", value: "relaxing" },
      { id: "energizing", text: "Energizing & Uplifting", value: "energizing" },
      { id: "romantic", text: "Romantic & Intimate", value: "romantic" },
      { id: "fresh", text: "Fresh & Clean", value: "fresh" },
      { id: "cozy", text: "Cozy & Warm", value: "cozy" },
    ],
  },
  {
    id: "favorite_scents",
    question: "Which scents do you love? (Select all that apply)",
    type: "multiple",
    options: [
      {
        id: "bakery",
        text: "Bakery (Cookies, Cake, Brownies)",
        value: "bakery",
      },
      {
        id: "citrus",
        text: "Citrus (Lemon, Orange, Grapefruit)",
        value: "citrus",
      },
      {
        id: "berry",
        text: "Berry (Strawberry, Blueberry, Raspberry)",
        value: "berry",
      },
      { id: "sweet", text: "Sweet (Vanilla, Caramel, Honey)", value: "sweet" },
      { id: "fresh", text: "Fresh (Mint, Eucalyptus, Ocean)", value: "fresh" },
      { id: "warm", text: "Warm (Cinnamon, Clove, Nutmeg)", value: "warm" },
    ],
  },
  {
    id: "space",
    question: "Where will you use this candle?",
    type: "single",
    options: [
      { id: "bedroom", text: "Bedroom", value: "bedroom" },
      { id: "living_room", text: "Living Room", value: "living_room" },
      { id: "bathroom", text: "Bathroom", value: "bathroom" },
      { id: "kitchen", text: "Kitchen", value: "kitchen" },
      { id: "office", text: "Office/Workspace", value: "office" },
    ],
  },
  {
    id: "intensity",
    question: "How strong do you like your scents?",
    type: "single",
    options: [
      { id: "subtle", text: "Subtle & Light", value: "subtle" },
      { id: "medium", text: "Medium Strength", value: "medium" },
      { id: "strong", text: "Strong & Bold", value: "strong" },
    ],
  },
  {
    id: "season",
    question: "What season best describes your preference?",
    type: "single",
    options: [
      { id: "spring", text: "Spring (Fresh & Floral)", value: "spring" },
      { id: "summer", text: "Summer (Light & Citrus)", value: "summer" },
      { id: "fall", text: "Fall (Warm & Spicy)", value: "fall" },
      { id: "winter", text: "Winter (Cozy & Woody)", value: "winter" },
      { id: "year_round", text: "Year-Round (Versatile)", value: "year_round" },
    ],
  },
];

// Mood to scent type mapping
const moodToScentMapping: Record<string, string[]> = {
  relaxing: ["bakery", "sweet", "warm"],
  energizing: ["citrus", "fresh", "berry"],
  romantic: ["sweet", "warm"],
  fresh: ["fresh", "citrus"],
  cozy: ["bakery", "warm", "sweet"],
};

export function ScentTypeform({ isOpen, onClose }: ScentTypeformProps) {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const isFirstStep = currentStep === 0;

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        // Filter only visible candle products
        const candleProducts = (data.data || []).filter(
          (p: Product) =>
            p.visibility === "visible" && p.category !== "Spirit Wear",
        );
        setProducts(candleProducts);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const handleAnswer = (value: string) => {
    if (!currentQuestion) return;

    if (currentQuestion.type === "single") {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    } else {
      const currentAnswers = (answers[currentQuestion.id] as string[]) ?? [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((a) => a !== value)
        : [...currentAnswers, value];
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: newAnswers }));
    }
  };

  const calculateRecommendations = () => {
    const mood = answers.mood as string;
    const favoriteScents = (answers.favorite_scents as string[]) || [];

    // Get scent types based on mood
    const moodScents = moodToScentMapping[mood] || [];

    // Combine mood scents with user-selected scents
    const allPreferredScents = [...new Set([...moodScents, ...favoriteScents])];

    // Filter products that match any of the preferred scent tags
    const matchedProducts = products.filter((product) => {
      if (!product.tags || product.tags.length === 0) return false;

      // Check if product has any of the preferred scent tags
      return product.tags.some((tag) =>
        allPreferredScents.some((scent) =>
          tag.toLowerCase().includes(scent.toLowerCase()),
        ),
      );
    });

    // Sort by number of matching tags and take top 3
    const sortedProducts = matchedProducts
      .map((product) => {
        const matchCount =
          product.tags?.filter((tag) =>
            allPreferredScents.some((scent) =>
              tag.toLowerCase().includes(scent.toLowerCase()),
            ),
          ).length || 0;
        return { product, matchCount };
      })
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 3)
      .map((item) => item.product);

    // If we don't have enough matches, add random products
    if (sortedProducts.length < 3) {
      const remainingCount = 3 - sortedProducts.length;
      const otherProducts = products
        .filter((p) => !sortedProducts.includes(p))
        .slice(0, remainingCount);
      sortedProducts.push(...otherProducts);
    }

    setRecommendedProducts(sortedProducts);
    setShowResults(true);
  };

  const handleNext = () => {
    if (isLastStep) {
      calculateRecommendations();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendedProducts([]);
    setShowResults(false);
  };

  const handleClose = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendedProducts([]);
    setShowResults(false);
    onClose();
  };

  const addToCart = (product: Product) => {
    addItem(product, 1);
  };

  const isAnswerSelected = (value: string) => {
    if (!currentQuestion) return false;

    if (currentQuestion.type === "single") {
      return answers[currentQuestion.id] === value;
    } else {
      const currentAnswers = (answers[currentQuestion.id] as string[]) ?? [];
      return currentAnswers.includes(value);
    }
  };

  const canProceed = () => {
    if (!currentQuestion) return false;

    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.type === "single") {
      return currentAnswer && currentAnswer.length > 0;
    } else {
      return currentAnswer && (currentAnswer as string[]).length > 0;
    }
  };

  // Get image URL from product
  const getProductImageUrl = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (
        firstImage &&
        typeof firstImage === "object" &&
        "dataUri" in firstImage
      ) {
        return firstImage.dataUri;
      }
    }
    if (product.image) {
      return product.image;
    }
    return "/placeholder.png";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0">
        <div
          className="relative h-[65vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[90vh] lg:max-h-[75vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-2 top-2 z-10 bg-white/80 text-gray-500 hover:bg-white/90 hover:text-gray-700 sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex h-full flex-col items-stretch lg:flex-row">
            {/* Left Side - Image */}
            <div className="relative m-0 h-1/3 w-full flex-shrink-0 overflow-hidden rounded-l-3xl p-0 sm:h-64 lg:h-full lg:w-1/2">
              <Image
                src="/images/featured/F1.png"
                alt="Candle"
                fill
                className="object-cover"
                style={{
                  objectPosition: "center 20%",
                  margin: 0,
                  padding: 0,
                  top: 0,
                  left: 0,
                  transform: "scale(1.1)",
                }}
              />
              <div className="absolute inset-0 flex items-end justify-start bg-black/20 p-4 sm:p-6 lg:p-8">
                <div className="text-left text-white">
                  <h3 className="mb-2 text-lg font-semibold drop-shadow-lg sm:mb-4 sm:text-xl lg:text-2xl">
                    Find Your Perfect Candle
                  </h3>
                  <p className="max-w-md text-sm drop-shadow-md sm:text-base lg:text-lg">
                    Answer a few questions and we&apos;ll recommend the perfect
                    candle for you!
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Questions/Results */}
            <div className="scrollbar-hide flex h-2/3 w-full flex-col overflow-y-auto rounded-r-3xl p-4 sm:h-auto sm:p-6 lg:h-full lg:w-1/2 lg:p-8 lg:pt-16">
              {loading ? (
                // Loading State
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                </div>
              ) : showResults ? (
                // Results View
                <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto sm:space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                    Your Perfect Matches
                  </h2>

                  {recommendedProducts.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-gray-600">
                        We couldn&apos;t find any perfect matches at the moment.
                      </p>
                      <Button
                        onClick={handleRestart}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {recommendedProducts.map((product) => {
                        const imageUrl = getProductImageUrl(product);
                        const price =
                          product.salePrice ??
                          product.price ??
                          product.regularPrice ??
                          0;

                        return (
                          <div
                            key={product.id}
                            className="rounded-2xl border border-gray-200 p-3 sm:p-4"
                          >
                            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4 lg:flex-row lg:items-start">
                              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                                <Image
                                  src={imageUrl}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full rounded-xl object-cover"
                                />
                              </div>
                              <div className="w-full flex-1 text-center sm:text-left lg:text-left">
                                <h4 className="mb-1 font-bold text-gray-900">
                                  {product.name}
                                </h4>
                                <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                                  {product.shortDescription ||
                                    product.description}
                                </p>
                                <div className="mb-3 flex items-center justify-between">
                                  {product.tags && product.tags.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {product.tags.slice(0, 2).join(", ")}
                                    </span>
                                  )}
                                  <span className="ml-auto text-lg font-bold text-black">
                                    ${price.toFixed(2)}
                                  </span>
                                </div>
                                <Button
                                  onClick={() => addToCart(product)}
                                  className="flex w-full items-center justify-center gap-2 bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button
                      onClick={handleRestart}
                      variant="outline"
                      className="flex flex-1 items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Take Quiz Again
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="flex flex-1 items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                // Questions View
                <div className="flex flex-1 flex-col space-y-4 pt-8 sm:space-y-6 sm:pt-12">
                  {/* Progress Bar */}
                  <div>
                    <div className="mb-2 flex justify-between text-sm text-gray-600">
                      <span>
                        Question {currentStep + 1} of {questions.length}
                      </span>
                      <span>
                        {Math.round(
                          ((currentStep + 1) / questions.length) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-black transition-all duration-300"
                        style={{
                          width: `${((currentStep + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <h3 className="mb-3 text-base font-bold text-gray-900 sm:mb-4 sm:text-lg">
                      {currentQuestion?.question}
                    </h3>

                    <div className="space-y-2">
                      {currentQuestion?.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer(option.value)}
                          className={`w-full rounded-xl border-2 p-2 text-left transition-all duration-200 sm:p-3 ${
                            isAnswerSelected(option.value)
                              ? "border-black bg-gray-50 text-gray-900"
                              : "hover:bg-gray-25 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-4 w-4 rounded-full border-2 ${
                                isAnswerSelected(option.value)
                                  ? "border-black bg-black"
                                  : "border-gray-300"
                              }`}
                            >
                              {isAnswerSelected(option.value) && (
                                <div className="m-0.5 h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {option.text}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="mt-auto flex flex-col justify-between gap-3 pt-4 sm:flex-row sm:gap-4">
                    <Button
                      onClick={handlePrevious}
                      disabled={isFirstStep}
                      variant="outline"
                      className="flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="flex w-full items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 sm:w-auto"
                    >
                      {isLastStep ? "Get My Results" : "Next"}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

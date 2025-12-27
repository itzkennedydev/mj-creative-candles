'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Container } from '~/components/ui/container';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: 1,
    title: "Slow & Steady Burn",
    description: "Long lasting burn for up to 16 hours",
    icon: "/images/icons/timer.png"
  },
  {
    id: 2,
    title: "Eco-Friendly Materials",
    description: "Renewable soy wax",
    icon: "/images/icons/tree.png"
  },
  {
    id: 3,
    title: "Hand Poured with Care",
    description: "Each candle is individually crafted",
    icon: "/images/icons/spock-hand-gesture.png"
  },
  {
    id: 4,
    title: "Clean Burn",
    description: "No soot, smoke or wax residue",
    icon: "/images/icons/sparks.png"
  }
];

function FeaturesSectionComponent() {
  return (
    <section className="hidden sm:block py-4 sm:py-6 bg-white border-b border-gray-200">
      <Container>
        {/* Features Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-center gap-3 sm:gap-4 group py-3 sm:py-4">
              {/* Icon on the left */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-300">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    width={24}
                    height={24}
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                  />
                </div>
              </div>

                  {/* Content on the right */}
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: '"GT Walsheim", Roboto, Rubik, sans-serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-tight" style={{ fontFamily: '"GT Walsheim", Roboto, Rubik, sans-serif' }}>
                      {feature.description}
                    </p>
                  </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Memoize the component since it has static content
export const FeaturesSection = memo(FeaturesSectionComponent);

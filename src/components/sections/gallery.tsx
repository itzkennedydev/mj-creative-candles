"use client";

import Image from "next/image";
import { Container } from "~/components/ui/container";
import { Instagram } from "lucide-react";

const galleryImages = [
  {
    src: "/showcase/S1.jpg",
    alt: "Custom embroidery showcase 1"
  },
  {
    src: "/showcase/S2.jpeg",
    alt: "Custom embroidery showcase 2"
  },
  {
    src: "/showcase/S1.jpg",
    alt: "Custom embroidery showcase 3"
  },
  {
    src: "/showcase/S2.jpeg",
    alt: "Custom embroidery showcase 4"
  },
  {
    src: "/showcase/S1.jpg",
    alt: "Custom embroidery showcase 5"
  },
  {
    src: "/showcase/S2.jpeg",
    alt: "Custom embroidery showcase 6"
  },
  {
    src: "/showcase/S1.jpg",
    alt: "Custom embroidery showcase 7"
  },
  {
    src: "/showcase/S2.jpeg",
    alt: "Custom embroidery showcase 8"
  }
];

export function Gallery() {
  return (
    <section className="py-16 bg-white">
      <Container>
        <div className="flex flex-col items-center space-y-8">
          <a
            href="https://www.instagram.com/stitchpleaseqc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg font-medium text-gray-900 hover:text-gray-700 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span>Follow us @stitchpleaseqc</span>
          </a>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
            {galleryImages.map((image, index) => (
              <a
                key={`${image.src}-${index}`}
                href="https://www.instagram.com/stitchpleaseqc"
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square group overflow-hidden rounded-xl"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  priority={index < 4}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

// Add TypeScript type for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
  }
} 
import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/ui/container";
import { Eye } from "lucide-react";
import { IMAGE_URLS } from "~/lib/image-config";

interface CategoryCard {
  title: string;
  image: string;
  href: string;
  description: string;
  services: string[];
}

const categories: CategoryCard[] = [
  {
    title: "Signature Scents",
    image: IMAGE_URLS.categories.tops,
    href: "/shop",
    description: "Our most popular handcrafted candle collections",
    services: ["Seasonal Blends", "Classic Favorites", "Limited Edition"],
  },
  {
    title: "Custom Candles",
    image: IMAGE_URLS.categories.spiritWear,
    href: "/shop",
    description: "Create your own unique scent combinations",
    services: ["Choose Your Scent", "Personalized Labels", "Custom Colors"],
  },
  {
    title: "Gift Sets",
    image: IMAGE_URLS.categories.hats,
    href: "/shop",
    description: "Beautifully packaged candle gift sets",
    services: ["Holiday Gifts", "Special Occasions", "Corporate Gifts"],
  },
  {
    title: "Accessories",
    image: IMAGE_URLS.categories.accessories,
    href: "/shop",
    description: "Candle care and home fragrance accessories",
    services: ["Wick Trimmers", "Snuffers", "Diffusers"],
  },
];

export function Categories() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 pt-8 md:pt-12">
      <Container>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              href={category.href}
              key={category.title}
              className="group relative overflow-hidden rounded-2xl bg-white transition-all duration-500 hover:shadow-2xl"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f]/90 via-[#1d1d1f]/50 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute right-4 top-4">
                  <Eye className="h-5 w-5 text-white/80 transition-opacity duration-300 group-hover:opacity-0" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex translate-y-0 transform flex-col items-center p-6 text-center transition-all duration-500 group-hover:-translate-y-8">
                  <h3 className="text-2xl font-bold text-white">
                    {category.title}
                  </h3>
                  <p className="mt-3 max-h-0 overflow-hidden text-sm text-white/90 opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                    {category.description}
                  </p>
                  <div className="mt-2 flex max-h-0 flex-wrap justify-center gap-2 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-20 group-hover:opacity-100">
                    {category.services.map((service, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-white/20 px-2 py-1 text-xs text-white/90 backdrop-blur-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

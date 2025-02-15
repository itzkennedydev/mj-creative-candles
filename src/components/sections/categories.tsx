import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/ui/container";
import { Eye } from "lucide-react";

interface CategoryCard {
  title: string;
  image: string;
  href: string;
  description: string;
  services: string[];
}

const categories: CategoryCard[] = [
  {
    title: "Apparel Embroidery",
    image: "/categories/Tops.jpeg",
    href: "/services/apparel-embroidery",
    description: "Premium embroidered designs for shirts and tops",
    services: ["Business Logos", "Names & Numbers", "Custom Designs"]
  },
  {
    title: "Screen Printing",
    image: "/categories/Bottoms.jpeg",
    href: "/services/screen-printing",
    description: "High-quality screen printing for all garments",
    services: ["Bulk Orders", "Team Uniforms", "Custom Graphics"]
  },
  {
    title: "Headwear",
    image: "/categories/Hats.jpeg",
    href: "/services/headwear",
    description: "Custom embroidered hats and caps",
    services: ["Baseball Caps", "Beanies", "Visors"]
  },
  {
    title: "Accessories",
    image: "/categories/ACS.jpeg",
    href: "/services/accessories",
    description: "Branded accessories and specialty items",
    services: ["Bags", "Patches", "Small Items"]
  },
];

export function Categories() {
  return (
    <section className="pt-12 md:pt-20 bg-gradient-to-b from-white to-gray-50">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link
              href={category.href}
              key={category.title}
              className="group relative overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-500 bg-white"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
                <div className="absolute top-4 right-4">
                  <Eye className="w-5 h-5 text-white/80 group-hover:opacity-0 transition-opacity duration-300" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-6 text-center transform transition-all duration-500 translate-y-0 group-hover:-translate-y-8">
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                  <p className="text-white/90 text-sm mt-3 max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-h-0 group-hover:max-h-20 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden mt-2">
                    {category.services.map((service, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white/90"
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
import Image from "next/image";
import Link from "next/link";
import { Container } from "~/components/ui/container";

interface CategoryCard {
  title: string;
  image: string;
  href: string;
}

const categories: CategoryCard[] = [
  {
    title: "Tops",
    image: "/categories/Tops.jpeg",
    href: "/category/tops",
  },
  {
    title: "Bottoms",
    image: "/categories/Bottoms.jpeg",
    href: "/category/bottoms",
  },
  {
    title: "Hats",
    image: "/categories/Hats.jpeg",
    href: "/category/hats",
  },
  {
    title: "Accessories",
    image: "/categories/ACS.jpeg",
    href: "/category/accessories",
  },
];

export function Categories() {
  return (
    <section className="py-8 md:py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              href={category.href}
              key={category.title}
              className="group relative overflow-hidden rounded-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
} 
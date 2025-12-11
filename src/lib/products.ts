import type { Product } from "./types";

export const products: Product[] = [
  {
    id: "1",
    name: "Custom Embroidered T-Shirt",
    description: "High-quality cotton t-shirt with custom embroidery",
    price: 25.99,
    image: "/categories/Tops.jpeg",
    category: "Apparel",
    inStock: true,
  },
  {
    id: "2",
    name: "Black T-Shirt",
    description:
      "Comfortable 50-50 cotton poly blend black t-shirt, perfect for custom embroidery",
    price: 22.0,
    image: "/placeholder-black-tshirt.jpg",
    category: "Apparel",
    inStock: true,
  },
  {
    id: "3",
    name: "Black Hoodie",
    description:
      "Warm and cozy 50-50 cotton poly blend black hoodie, ideal for custom embroidery",
    price: 35.0,
    image: "/placeholder-black-hoodie.jpg",
    category: "Apparel",
    inStock: true,
  },
];

/**
 * Image URL Configuration
 * All images are served as static files from the /public directory
 */

export const IMAGE_URLS = {
  // CTA Images
  cta: {
    image1: "/CTA/1.jpg",
    image2: "/CTA/2.jpg",
    image3: "/CTA/3.jpg",
  },

  // Category Images
  categories: {
    accessories: "/categories/ACS.jpeg",
    hats: "/categories/Hats.jpg",
    spiritWear: "/categories/SP.jpeg",
    tops: "/categories/Tops.jpeg",
  },

  // Logo Images
  logo: {
    main: "/images/logo/MJLogo.png",
  },

  // Showcase Images
  showcase: {
    image1: "/showcase/S1.jpg",
    image2: "/showcase/S2.jpeg",
  },
} as const;

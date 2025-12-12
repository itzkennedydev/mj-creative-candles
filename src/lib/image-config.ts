/**
 * Image URL Configuration
 * All images are served as static files from the /public directory
 */

export const IMAGE_URLS = {
  // Hero Images
  hero: {
    main: "/images/hero/hero.jpg",
  },

  // Featured Product Images
  featured: {
    product1: "/images/featured/optimized_F1.png",
    product2: "/images/featured/optimized_F2.png",
    product3: "/images/featured/optimized_F3.png",
    product4: "/images/featured/optimized_F4.png",
  },

  // Logo Images
  logo: {
    main: "/images/logo/MJLogo_optimized.png",
  },

  // Banner Image
  banner: {
    main: "/images/banner_optimized.jpg",
  },

  // Icon Images
  icons: {
    sparks: "/images/icons/sparks.png",
    spockHand: "/images/icons/spock-hand-gesture.png",
    timer: "/images/icons/timer.png",
    tree: "/images/icons/tree.png",
  },

  // Gallery Images (Lower Gallery)
  gallery: {
    image1: "/images/lowergal/optimized_1g.png",
    image2: "/images/lowergal/optimized_2g.png",
    image3: "/images/lowergal/optimized_3g.png",
    image4: "/images/lowergal/optimized_4g.png",
    image5: "/images/lowergal/optimized_5g.png",
    image6: "/images/lowergal/optimized_6.png",
    image7: "/images/lowergal/optimized_7g.png",
    image8: "/images/lowergal/optimized_8g.png",
  },

  // Owner Images
  owners: {
    owner1: "/images/owners/J_optimized.jpg",
    owner2: "/images/owners/M_optimized.jpg",
  },
} as const;

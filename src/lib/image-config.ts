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
    product1: "/images/featured/F1.png",
    product2: "/images/featured/F2.png",
    product3: "/images/featured/F3.png",
    product4: "/images/featured/F4.png",
  },

  // Logo Images
  logo: {
    main: "/images/logo/MJLogo.png",
  },

  // Banner Image
  banner: {
    main: "/images/banner.png",
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
    image1: "/images/lowergal/1g.png",
    image2: "/images/lowergal/2g.png",
    image3: "/images/lowergal/3g.png",
    image4: "/images/lowergal/4g.png",
    image5: "/images/lowergal/5g.png",
    image6: "/images/lowergal/6.png",
    image7: "/images/lowergal/7g.png",
    image8: "/images/lowergal/8g.png",
  },

  // Owner Images
  owners: {
    owner1: "/images/owners/J.png",
    owner2: "/images/owners/M.jpg",
  },
} as const;

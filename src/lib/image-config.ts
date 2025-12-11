/**
 * Image URL Configuration
 * All image URLs are served from MongoDB GridFS via /api/images/[id]
 * This file maps logical image names to their database IDs
 */

export const IMAGE_URLS = {
  // CTA Images
  cta: {
    image1: "/api/images/693a8646b42a0dcaee116211",
    image2: "/api/images/693a8646b42a0dcaee116214",
    image3: "/api/images/693a8647b42a0dcaee116217",
  },

  // Category Images
  categories: {
    accessories: "/api/images/693a8647b42a0dcaee11621c",
    hats: "/api/images/693a8648b42a0dcaee11622d",
    spiritWear: "/api/images/693a8649b42a0dcaee11623b",
    tops: "/api/images/693a864ab42a0dcaee116250",
  },

  // Logo Images
  logo: {
    main: "/api/images/693a864ab42a0dcaee116258",
  },

  // Showcase Images
  showcase: {
    image1: "/api/images/693a864bb42a0dcaee116266",
    image2: "/api/images/693a864bb42a0dcaee11626b",
  },
} as const;

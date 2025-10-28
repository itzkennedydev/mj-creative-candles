export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
  brand?: string;
  category?: string;
}

export const defaultSEO: SEOProps = {
  title: 'Stitch Please - Custom Embroidery & Apparel',
  description: 'Premium custom embroidery services and apparel. Create unique designs with our professional embroidery services. Shop our collection of t-shirts, hoodies, and more.',
  keywords: ['custom embroidery', 'apparel', 't-shirts', 'hoodies', 'custom design', 'embroidery services'],
  image: '/Logo.png',
  url: 'https://stitchplease.com',
  type: 'website',
  brand: 'Stitch Please',
};

export function generateSEOTags(seo: SEOProps = {}) {
  const mergedSEO = { ...defaultSEO, ...seo };
  
  return {
    title: mergedSEO.title,
    description: mergedSEO.description,
    keywords: mergedSEO.keywords?.join(', '),
    openGraph: {
      title: mergedSEO.title,
      description: mergedSEO.description,
      url: mergedSEO.url,
      siteName: 'Stitch Please',
      images: [
        {
          url: mergedSEO.image || '/Logo.png',
          width: 1200,
          height: 630,
          alt: mergedSEO.title,
        },
      ],
      locale: 'en_US',
      type: mergedSEO.type,
    },
    twitter: {
      card: 'summary_large_image',
      title: mergedSEO.title,
      description: mergedSEO.description,
      images: [mergedSEO.image || '/Logo.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateProductStructuredData(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  inStock: boolean;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Stitch Please',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Stitch Please',
      },
    },
  };
}

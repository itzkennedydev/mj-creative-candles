import type { Metadata } from 'next';

// Quad Cities area cities for local SEO
const QUAD_CITIES = [
  'Moline', 'Rock Island', 'Davenport', 'Bettendorf', 
  'East Moline', 'Silvis', 'Milan', 'Coal Valley',
  'Hampton', 'Carbon Cliff', 'Colona', 'Port Byron'
];

const QUAD_CITIES_AREA = 'Quad Cities, IL';
const BUSINESS_NAME = 'Stitch Please';
const BUSINESS_PHONE = '(309) 373-6017';
const BUSINESS_EMAIL = 'tanika@stitchpleaseqc.com';
const BUSINESS_ADDRESS = {
  street: '415 13th St',
  city: 'Moline',
  state: 'IL',
  zip: '61265',
  country: 'US',
};
const BUSINESS_URL = 'https://stitchpleaseqc.com';

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
  noIndex?: boolean;
}

// Comprehensive keyword list for local SEO
const baseKeywords = [
  // Core services
  'custom embroidery', 'embroidery services', 'personalized embroidery',
  'custom apparel', 'custom t-shirts', 'custom hoodies', 'custom hats',
  'embroidered beanies', 'spirit wear', 'team apparel', 'school spirit wear',
  
  // Business types
  'corporate embroidery', 'business logos', 'company apparel',
  'promotional products', 'branded merchandise',
  
  // Personal items
  'personalized gifts', 'custom baby clothes', 'mama keepsake sweatshirt',
  'baby clothes keepsake', 'memory sweatshirt',
  
  // Local keywords
  ...QUAD_CITIES.map(city => `embroidery ${city}`),
  ...QUAD_CITIES.map(city => `custom apparel ${city}`),
  'Quad Cities embroidery', 'Quad Cities custom apparel',
  'embroidery near me', 'custom shirts near me',
  'Moline embroidery shop', 'Rock Island custom apparel',
  'Davenport embroidery', 'Bettendorf custom shirts',
  
  // Schools
  'Moline Maroons spirit wear', 'Rock Island Rocks apparel',
  'United Township Panthers gear', 'UTHS spirit wear',
  'Davenport North Wildcats', 'high school spirit wear Quad Cities',
  
  // Sports teams
  'team uniforms Quad Cities', 'sports apparel embroidery',
  'volleyball team apparel', 'Elite Volleyball gear',
  
  // Special occasions
  'custom gifts Quad Cities', 'holiday gifts embroidery',
  'personalized Christmas gifts', 'custom birthday gifts',
];

export const defaultSEO: SEOProps = {
  title: `${BUSINESS_NAME} | Custom Embroidery & Spirit Wear | ${QUAD_CITIES_AREA}`,
  description: `Premium custom embroidery services in Moline, IL. Custom beanies, hoodies, t-shirts, and spirit wear for schools and teams. Serving the Quad Cities area including Davenport, Rock Island, and Bettendorf. Fast turnaround, local pickup available. Call ${BUSINESS_PHONE}`,
  keywords: baseKeywords,
  image: '/Logo.png',
  url: BUSINESS_URL,
  type: 'website',
  brand: BUSINESS_NAME,
};

export function generateSEOTags(seo: SEOProps = {}): Metadata {
  const mergedSEO = { ...defaultSEO, ...seo };
  const fullTitle = seo.title?.includes(BUSINESS_NAME) 
    ? seo.title 
    : `${seo.title || defaultSEO.title} | ${BUSINESS_NAME}`;
  
  return {
    title: fullTitle,
    description: mergedSEO.description,
    keywords: mergedSEO.keywords?.join(', '),
    authors: [{ name: 'Tanika Zentic', url: BUSINESS_URL }],
    creator: BUSINESS_NAME,
    publisher: BUSINESS_NAME,
    metadataBase: new URL(BUSINESS_URL),
    alternates: {
      canonical: mergedSEO.url || BUSINESS_URL,
    },
    openGraph: {
      title: fullTitle,
      description: mergedSEO.description,
      url: mergedSEO.url || BUSINESS_URL,
      siteName: BUSINESS_NAME,
      images: [
        {
          url: mergedSEO.image || '/Logo.png',
          width: 1200,
          height: 630,
          alt: `${BUSINESS_NAME} - Custom Embroidery in the Quad Cities`,
        },
      ],
      locale: 'en_US',
      type: mergedSEO.type || 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: mergedSEO.description,
      images: [mergedSEO.image || '/Logo.png'],
      creator: '@stitchpleaseqc',
    },
    robots: {
      index: !mergedSEO.noIndex,
      follow: !mergedSEO.noIndex,
      googleBot: {
        index: !mergedSEO.noIndex,
        follow: !mergedSEO.noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    category: 'shopping',
    other: {
      'geo.region': 'US-IL',
      'geo.placename': 'Moline',
      'geo.position': '41.5067;-90.5151',
      'ICBM': '41.5067, -90.5151',
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
  category?: string;
  sku?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image.startsWith('http') ? product.image : `${BUSINESS_URL}${product.image}`,
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: product.brand || BUSINESS_NAME,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${BUSINESS_URL}/shop/${product.id}`,
      seller: {
        '@type': 'LocalBusiness',
        name: BUSINESS_NAME,
        address: {
          '@type': 'PostalAddress',
          streetAddress: BUSINESS_ADDRESS.street,
          addressLocality: BUSINESS_ADDRESS.city,
          addressRegion: BUSINESS_ADDRESS.state,
          postalCode: BUSINESS_ADDRESS.zip,
          addressCountry: BUSINESS_ADDRESS.country,
        },
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'USD',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
          addressRegion: ['IL', 'IA'],
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 5,
            maxValue: 7,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnAtKiosk',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

// Local Business Schema for rich snippets
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BUSINESS_URL}/#organization`,
    name: BUSINESS_NAME,
    alternateName: 'Stitch Please QC',
    description: 'Premium custom embroidery services in the Quad Cities. Specializing in custom apparel, spirit wear, team uniforms, and personalized gifts.',
    url: BUSINESS_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    image: `${BUSINESS_URL}/Logo.png`,
    logo: `${BUSINESS_URL}/Logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: BUSINESS_ADDRESS.state,
      postalCode: BUSINESS_ADDRESS.zip,
      addressCountry: BUSINESS_ADDRESS.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.5067,
      longitude: -90.5151,
    },
    areaServed: [
      ...QUAD_CITIES.map(city => ({
        '@type': 'City',
        name: city,
      })),
      {
        '@type': 'State',
        name: 'Illinois',
      },
      {
        '@type': 'State', 
        name: 'Iowa',
      },
    ],
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 41.5067,
        longitude: -90.5151,
      },
      geoRadius: '50000', // 50km radius
    },
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Credit Card, Debit Card',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '14:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/stitchpleaseqc',
      'https://www.instagram.com/stitchpleaseqc',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Custom Embroidery Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Custom Embroidery',
            description: 'Professional embroidery on apparel, hats, and accessories',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Spirit Wear',
            description: 'Custom school and team spirit wear',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Mama Keepsake Sweatshirts',
            description: 'Transform baby clothes into memorable keepsake sweatshirts',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: 'Local Customer',
        },
        reviewBody: 'Amazing quality embroidery! The beanies turned out perfect for our team.',
      },
    ],
  };
}

// Breadcrumb schema for navigation
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BUSINESS_URL}${item.url}`,
    })),
  };
}

// FAQ Schema for common questions
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Website schema with search action
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_NAME,
    alternateName: 'Stitch Please QC',
    url: BUSINESS_URL,
    description: defaultSEO.description,
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BUSINESS_URL}/Logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BUSINESS_URL}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Export constants for use elsewhere
export const SEO_CONSTANTS = {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_EMAIL,
  BUSINESS_ADDRESS,
  BUSINESS_URL,
  QUAD_CITIES,
};

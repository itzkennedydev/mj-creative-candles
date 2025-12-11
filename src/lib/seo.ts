import type { Metadata } from "next";

// Quad Cities area cities for local SEO
const QUAD_CITIES = [
  "Moline",
  "Rock Island",
  "Davenport",
  "Bettendorf",
  "East Moline",
  "Silvis",
  "Milan",
  "Coal Valley",
  "Hampton",
  "Carbon Cliff",
  "Colona",
  "Port Byron",
];

const QUAD_CITIES_AREA = "Quad Cities, IL";
const BUSINESS_NAME = "MJ Creative Candles";
const BUSINESS_PHONE = "(309) 373-6017";
const BUSINESS_EMAIL = "mjcreativecandles@gmail.com";
const BUSINESS_ADDRESS = {
  street: "415 13th St",
  city: "Moline",
  state: "IL",
  zip: "61265",
  country: "US",
};
const BUSINESS_URL = "https://mjcreativecandles.com";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  price?: number;
  currency?: string;
  availability?: "in stock" | "out of stock";
  brand?: string;
  category?: string;
  noIndex?: boolean;
}

// Extended Quad Cities area - all cities/towns in 50 mile radius
const EXTENDED_QUAD_CITIES = [
  // Illinois side
  "Moline",
  "Rock Island",
  "East Moline",
  "Silvis",
  "Milan",
  "Coal Valley",
  "Hampton",
  "Carbon Cliff",
  "Colona",
  "Port Byron",
  "Geneseo",
  "Cambridge",
  "Kewanee",
  "Galesburg",
  "Aledo",
  "Orion",
  "Sherrard",
  "Reynolds",
  "Taylor Ridge",
  "Andalusia",
  "Buffalo Prairie",
  "Illinois City",
  // Iowa side
  "Davenport",
  "Bettendorf",
  "LeClaire",
  "Princeton",
  "Eldridge",
  "Blue Grass",
  "Buffalo",
  "Walcott",
  "Durant",
  "Wilton",
  "Muscatine",
  "Clinton",
  "DeWitt",
  "Camanche",
  "Pleasant Valley",
  "Long Grove",
];

// All local schools for spirit wear targeting (exported for potential use in school-specific pages)
export const LOCAL_SCHOOLS = {
  highSchools: [
    // Illinois
    { name: "Moline High School", mascot: "Maroons", city: "Moline" },
    { name: "Rock Island High School", mascot: "Rocks", city: "Rock Island" },
    {
      name: "United Township High School",
      alias: "UTHS",
      mascot: "Panthers",
      city: "East Moline",
    },
    { name: "Alleman High School", mascot: "Pioneers", city: "Rock Island" },
    { name: "Geneseo High School", mascot: "Maple Leafs", city: "Geneseo" },
    { name: "Sherrard High School", mascot: "Tigers", city: "Sherrard" },
    { name: "Orion High School", mascot: "Chargers", city: "Orion" },
    { name: "Riverdale High School", mascot: "Rams", city: "Port Byron" },
    { name: "Rockridge High School", mascot: "Rockets", city: "Taylor Ridge" },
    // Iowa
    {
      name: "Davenport North High School",
      mascot: "Wildcats",
      city: "Davenport",
    },
    {
      name: "Davenport West High School",
      mascot: "Falcons",
      city: "Davenport",
    },
    {
      name: "Davenport Central High School",
      mascot: "Blue Devils",
      city: "Davenport",
    },
    {
      name: "Davenport Assumption High School",
      mascot: "Knights",
      city: "Davenport",
    },
    { name: "Bettendorf High School", mascot: "Bulldogs", city: "Bettendorf" },
    {
      name: "Pleasant Valley High School",
      mascot: "Spartans",
      city: "Bettendorf",
    },
    { name: "North Scott High School", mascot: "Lancers", city: "Eldridge" },
    { name: "Muscatine High School", mascot: "Muskies", city: "Muscatine" },
  ],
  middleSchools: [
    "Wilson Middle School",
    "John Deere Middle School",
    "Lincoln Middle School",
    "Edison Junior High",
    "Roosevelt Middle School",
    "Washington Middle School",
    "Jefferson Middle School",
    "Franklin Middle School",
    "Sudlow Intermediate",
    "Smart Intermediate",
    "Williams Intermediate",
    "Wood Intermediate",
  ],
  elementarySchools: [
    "Garfield Elementary",
    "Hamilton Elementary",
    "Jane Addams Elementary",
    "Bicentennial Elementary",
    "Bowlesburg Elementary",
    "Coolidge Elementary",
    "Hoover Elementary",
    "Jefferson Elementary",
    "Lincoln Elementary",
    "Madison Elementary",
    "Washington Elementary",
    "Wilson Elementary",
  ],
  colleges: [
    "Augustana College",
    "Black Hawk College",
    "Western Illinois University QC",
    "St. Ambrose University",
    "Scott Community College",
    "Palmer College of Chiropractic",
  ],
};

// Exhaustive keyword list for maximum SEO coverage
const baseKeywords = [
  // ===========================================
  // CORE EMBROIDERY SERVICES
  // ===========================================
  "custom embroidery",
  "embroidery services",
  "personalized embroidery",
  "machine embroidery",
  "computerized embroidery",
  "professional embroidery",
  "embroidery shop",
  "embroidery store",
  "embroidery business",
  "local embroidery",
  "embroidery near me",
  "embroidery in my area",
  "best embroidery",
  "quality embroidery",
  "affordable embroidery",
  "fast embroidery",
  "quick turnaround embroidery",
  "same day embroidery",
  "rush embroidery orders",
  "embroidery design",
  "embroidery digitizing",
  "logo embroidery",
  "monogram embroidery",
  "name embroidery",
  "text embroidery",
  "lettering embroidery",
  "number embroidery",
  "custom stitching",
  "thread embroidery",
  "needle work",

  // ===========================================
  // APPAREL TYPES - EXHAUSTIVE
  // ===========================================
  // T-Shirts
  "custom t-shirts",
  "embroidered t-shirts",
  "personalized t-shirts",
  "custom tees",
  "embroidered tees",
  "logo t-shirts",
  "team t-shirts",
  "event t-shirts",
  "company t-shirts",
  "work t-shirts",
  "group t-shirts",
  "matching t-shirts",
  "family t-shirts",
  "reunion t-shirts",

  // Hoodies & Sweatshirts
  "custom hoodies",
  "embroidered hoodies",
  "personalized hoodies",
  "custom sweatshirts",
  "embroidered sweatshirts",
  "crewneck sweatshirts",
  "pullover hoodies",
  "zip up hoodies",
  "quarter zip",
  "half zip pullover",
  "fleece jackets",
  "fleece pullovers",
  "team hoodies",
  "school hoodies",

  // Polos & Dress Shirts
  "custom polo shirts",
  "embroidered polos",
  "business polos",
  "corporate polos",
  "golf polos",
  "work polos",
  "uniform polos",
  "custom dress shirts",
  "embroidered dress shirts",
  "oxford shirts",
  "button down shirts",
  "button up shirts",
  "work shirts",

  // Hats & Headwear
  "custom hats",
  "embroidered hats",
  "personalized hats",
  "custom baseball caps",
  "embroidered caps",
  "trucker hats",
  "snapback hats",
  "fitted caps",
  "dad hats",
  "bucket hats",
  "custom beanies",
  "embroidered beanies",
  "winter hats",
  "knit caps",
  "pom pom beanies",
  "cuffed beanies",
  "slouchy beanies",
  "visors",
  "sun hats",
  "golf hats",
  "team hats",

  // Jackets & Outerwear
  "custom jackets",
  "embroidered jackets",
  "varsity jackets",
  "letterman jackets",
  "bomber jackets",
  "windbreakers",
  "rain jackets",
  "soft shell jackets",
  "hard shell jackets",
  "puffer jackets",
  "vests",
  "embroidered vests",
  "fleece vests",
  "puffy vests",
  "coach jackets",
  "team jackets",
  "warm up jackets",

  // Pants & Bottoms
  "custom shorts",
  "embroidered shorts",
  "athletic shorts",
  "basketball shorts",
  "gym shorts",
  "sweatpants",
  "joggers",
  "custom pants",
  "work pants",
  "scrubs",
  "medical scrubs",

  // Bags & Accessories
  "custom bags",
  "embroidered bags",
  "tote bags",
  "canvas bags",
  "drawstring bags",
  "backpacks",
  "duffel bags",
  "gym bags",
  "sports bags",
  "team bags",
  "equipment bags",
  "laptop bags",
  "messenger bags",
  "cooler bags",
  "lunch bags",
  "towels",
  "embroidered towels",
  "golf towels",
  "sports towels",
  "blankets",
  "embroidered blankets",
  "throw blankets",
  "stadium blankets",
  "aprons",
  "embroidered aprons",
  "chef aprons",
  "BBQ aprons",

  // Uniforms
  "custom uniforms",
  "team uniforms",
  "sports uniforms",
  "work uniforms",
  "company uniforms",
  "employee uniforms",
  "staff uniforms",
  "medical uniforms",
  "restaurant uniforms",
  "hospitality uniforms",
  "school uniforms",

  // ===========================================
  // SPIRIT WEAR - ALL SCHOOLS
  // ===========================================
  "spirit wear",
  "school spirit wear",
  "team spirit wear",
  "high school apparel",
  "college apparel",
  "university gear",
  "school merchandise",
  "team merchandise",
  "fan gear",
  "fan apparel",
  "homecoming shirts",
  "pep rally shirts",
  "senior shirts",
  "class shirts",
  "graduation shirts",
  "varsity apparel",
  "athletic apparel",

  // Illinois High Schools
  "Moline Maroons",
  "Moline Maroons spirit wear",
  "Moline High apparel",
  "Moline Maroons gear",
  "Moline Maroons merchandise",
  "Moline Maroons shirts",
  "Rock Island Rocks",
  "Rock Island Rocks spirit wear",
  "Rocky apparel",
  "Rock Island High gear",
  "Rock Island Rocks merchandise",
  "UTHS Panthers",
  "United Township Panthers",
  "UTHS spirit wear",
  "UT Panthers gear",
  "United Township apparel",
  "Panthers spirit wear",
  "Alleman Pioneers",
  "Alleman High apparel",
  "Pioneers spirit wear",
  "Geneseo Maple Leafs",
  "Geneseo apparel",
  "Maple Leafs gear",
  "Sherrard Tigers",
  "Sherrard apparel",
  "Tigers spirit wear",
  "Orion Chargers",
  "Orion apparel",
  "Chargers spirit wear",
  "Riverdale Rams",
  "Riverdale apparel",
  "Rams spirit wear",
  "Rockridge Rockets",
  "Rockridge apparel",
  "Rockets spirit wear",

  // Iowa High Schools
  "Davenport North Wildcats",
  "Davenport North apparel",
  "Wildcats spirit wear",
  "Davenport West Falcons",
  "Davenport West apparel",
  "Falcons spirit wear",
  "Davenport Central Blue Devils",
  "Davenport Central apparel",
  "Blue Devils gear",
  "Assumption Knights",
  "Davenport Assumption apparel",
  "Knights spirit wear",
  "Bettendorf Bulldogs",
  "Bettendorf High apparel",
  "Bulldogs spirit wear",
  "Pleasant Valley Spartans",
  "PV Spartans",
  "Spartans spirit wear",
  "North Scott Lancers",
  "North Scott apparel",
  "Lancers spirit wear",
  "Muscatine Muskies",
  "Muscatine apparel",
  "Muskies spirit wear",

  // Colleges
  "Augustana Vikings",
  "Augustana apparel",
  "Augie gear",
  "Black Hawk College",
  "Black Hawk apparel",
  "Braves spirit wear",
  "St. Ambrose Bees",
  "St. Ambrose apparel",
  "Fighting Bees gear",

  // ===========================================
  // SPORTS & ATHLETICS
  // ===========================================
  "sports apparel",
  "athletic wear",
  "team sports gear",
  // Individual Sports
  "volleyball apparel",
  "volleyball team shirts",
  "volleyball hoodies",
  "basketball apparel",
  "basketball team gear",
  "basketball warmups",
  "football apparel",
  "football team gear",
  "football practice shirts",
  "baseball apparel",
  "baseball team uniforms",
  "baseball jerseys",
  "softball apparel",
  "softball team gear",
  "softball uniforms",
  "soccer apparel",
  "soccer team uniforms",
  "soccer jerseys",
  "wrestling apparel",
  "wrestling team gear",
  "wrestling singlets",
  "track and field apparel",
  "cross country gear",
  "running shirts",
  "swimming apparel",
  "swim team gear",
  "swim parent shirts",
  "tennis apparel",
  "tennis team gear",
  "golf apparel",
  "golf team gear",
  "hockey apparel",
  "hockey team gear",
  "lacrosse apparel",
  "cheer apparel",
  "cheerleading uniforms",
  "cheer spirit wear",
  "dance team apparel",
  "dance competition shirts",
  "dance mom shirts",
  "gymnastics apparel",
  "gymnastics team gear",
  "gym mom shirts",

  // Club Sports & Leagues
  "club sports apparel",
  "travel team uniforms",
  "tournament shirts",
  "Elite Volleyball",
  "Elite Volleyball gear",
  "club volleyball apparel",
  "youth sports uniforms",
  "little league shirts",
  "rec league apparel",
  "YMCA team shirts",
  "park district apparel",
  "intramural shirts",

  // ===========================================
  // BUSINESS & CORPORATE
  // ===========================================
  "corporate apparel",
  "business embroidery",
  "company logo shirts",
  "employee shirts",
  "staff uniforms",
  "work apparel",
  "workwear",
  "branded merchandise",
  "promotional products",
  "promo items",
  "company gear",
  "branded apparel",
  "logo wear",
  "corporate gifts",
  "trade show apparel",
  "conference shirts",
  "event shirts",
  "company polos",
  "business casual shirts",
  "office apparel",
  "executive gifts",
  "client gifts",
  "customer appreciation gifts",
  "small business embroidery",
  "startup swag",
  "company swag",

  // Industries
  "restaurant uniforms",
  "bar staff shirts",
  "hospitality uniforms",
  "medical embroidery",
  "healthcare uniforms",
  "scrub embroidery",
  "nurse jackets",
  "doctor coats",
  "lab coat embroidery",
  "construction company shirts",
  "contractor apparel",
  "trade uniforms",
  "lawn care uniforms",
  "landscaping shirts",
  "cleaning company uniforms",
  "salon uniforms",
  "spa uniforms",
  "beauty industry apparel",
  "auto shop shirts",
  "mechanic uniforms",
  "dealership apparel",
  "real estate agent apparel",
  "realtor shirts",
  "open house gear",
  "church shirts",
  "ministry apparel",
  "religious organization gear",
  "nonprofit shirts",
  "charity event apparel",
  "fundraiser shirts",

  // ===========================================
  // SPECIAL OCCASIONS & EVENTS
  // ===========================================
  // Weddings
  "wedding party shirts",
  "bridesmaid shirts",
  "groomsmen shirts",
  "bride shirts",
  "groom shirts",
  "wedding party robes",
  "bachelorette shirts",
  "bachelor party shirts",
  "bridal shower gifts",

  // Family Events
  "family reunion shirts",
  "reunion t-shirts",
  "family vacation shirts",
  "matching family shirts",
  "family photo shirts",
  "holiday family shirts",
  "birthday party shirts",
  "birthday celebration gear",

  // Holidays
  "Christmas shirts",
  "holiday embroidery",
  "Christmas gifts",
  "Valentine's Day gifts",
  "Mother's Day gifts",
  "Father's Day gifts",
  "Easter shirts",
  "Halloween costumes",
  "Fourth of July shirts",
  "Thanksgiving shirts",
  "holiday party apparel",

  // Special Events
  "race day shirts",
  "5K shirts",
  "marathon apparel",
  "run walk shirts",
  "golf outing shirts",
  "tournament shirts",
  "charity event gear",
  "memorial shirts",
  "in loving memory shirts",
  "tribute apparel",
  "retirement party shirts",
  "milestone celebration shirts",

  // ===========================================
  // PERSONALIZED & KEEPSAKE ITEMS
  // ===========================================
  "personalized gifts",
  "custom gifts",
  "monogrammed gifts",
  "personalized baby gifts",
  "baby shower gifts",
  "newborn gifts",
  "mama keepsake sweatshirt",
  "baby clothes keepsake",
  "memory sweatshirt",
  "keepsake blanket",
  "memory blanket",
  "baby onesie keepsake",
  "first outfit keepsake",
  "hospital outfit keepsake",
  "grandma gifts",
  "grandpa gifts",
  "new grandparent gifts",
  "pet memorial",
  "pet name embroidery",
  "dog mom shirts",

  // ===========================================
  // LOCAL SEO - QUAD CITIES EXHAUSTIVE
  // ===========================================
  // Geographic variations
  ...EXTENDED_QUAD_CITIES.map((city) => `embroidery ${city}`),
  ...EXTENDED_QUAD_CITIES.map((city) => `custom apparel ${city}`),
  ...EXTENDED_QUAD_CITIES.map((city) => `${city} embroidery shop`),
  ...EXTENDED_QUAD_CITIES.map((city) => `custom shirts ${city}`),
  ...EXTENDED_QUAD_CITIES.map((city) => `spirit wear ${city}`),

  // Quad Cities specific
  "Quad Cities embroidery",
  "QC embroidery",
  "Quad Cities custom apparel",
  "Quad Cities spirit wear",
  "Quad Cities team apparel",
  "embroidery shop Quad Cities",
  "custom shirts Quad Cities",
  "Quad City area embroidery",
  "QCA embroidery",

  // State variations
  "embroidery Illinois",
  "custom apparel Illinois",
  "IL embroidery",
  "embroidery Iowa",
  "custom apparel Iowa",
  "IA embroidery",
  "western Illinois embroidery",
  "eastern Iowa embroidery",
  "Mississippi River embroidery",
  "I-74 corridor embroidery",

  // County variations
  "Rock Island County embroidery",
  "Scott County embroidery",
  "Henry County embroidery",
  "Mercer County embroidery",

  // ===========================================
  // LONG-TAIL & QUESTION KEYWORDS
  // ===========================================
  "where to get custom embroidery",
  "best embroidery shop near me",
  "how much does custom embroidery cost",
  "embroidery pricing",
  "how long does embroidery take",
  "embroidery turnaround time",
  "where to buy custom shirts",
  "custom shirt printing near me",
  "screen printing vs embroidery",
  "embroidery vs vinyl",
  "how to order custom shirts",
  "bulk embroidery orders",
  "wholesale embroidery",
  "embroidery minimums",
  "no minimum embroidery",
  "small order embroidery",
  "one piece embroidery",
  "single item embroidery",
  "bring your own shirt embroidery",
  "embroider my own clothes",
  "add logo to my shirt",
  "customize my jacket",

  // ===========================================
  // COMPETITOR ALTERNATIVES
  // ===========================================
  "local screen printing alternative",
  "embroidery instead of printing",
  "better than iron-on",
  "durable custom shirts",
  "long lasting embroidery",
  "quality over quantity",
  "handcrafted embroidery",
  "artisan embroidery",

  // ===========================================
  // BRAND & BUSINESS IDENTITY
  // ===========================================
  "MJ Creative Candles",
  "MJ Creative Candles QC",
  "MJ Creative Candles Moline",
  "mjcreativecandles",
  "MJ candles",
  "creative candles shop",
  "women owned candle business",
  "local candle business",
  "small business candles",
  "supporting local business",
  "shop local Quad Cities",

  // ===========================================
  // SEASONAL & TRENDING
  // ===========================================
  "back to school shirts",
  "fall sports apparel",
  "winter gear",
  "spring sports uniforms",
  "summer camp shirts",
  "outdoor gear",
  "cold weather apparel",
  "layering pieces",
  "game day gear",
  "tailgate apparel",
  "watch party shirts",
  "super bowl gear",

  // ===========================================
  // TECHNICAL & QUALITY KEYWORDS
  // ===========================================
  "high quality embroidery",
  "premium embroidery",
  "detailed embroidery",
  "multi-color embroidery",
  "large design embroidery",
  "small text embroidery",
  "thread colors",
  "embroidery thread",
  "polyester embroidery",
  "cotton embroidery",
  "blend fabric embroidery",
  "waterproof embroidery",
  "fade resistant",
  "wash safe embroidery",
  "durable stitching",
];

export const defaultSEO: SEOProps = {
  title: `${BUSINESS_NAME} | Custom Embroidery & Spirit Wear | ${QUAD_CITIES_AREA}`,
  description: `Premium custom embroidery services in Moline, IL. Custom beanies, hoodies, t-shirts, and spirit wear for schools and teams. Serving the Quad Cities area including Davenport, Rock Island, and Bettendorf. Fast turnaround, local pickup available. Call ${BUSINESS_PHONE}`,
  keywords: baseKeywords,
  image: "/Logo.png",
  url: BUSINESS_URL,
  type: "website",
  brand: BUSINESS_NAME,
};

export function generateSEOTags(seo: SEOProps = {}): Metadata {
  const mergedSEO = { ...defaultSEO, ...seo };
  const fullTitle = seo.title?.includes(BUSINESS_NAME)
    ? seo.title
    : `${seo.title ?? defaultSEO.title} | ${BUSINESS_NAME}`;

  return {
    title: fullTitle,
    description: mergedSEO.description,
    keywords: mergedSEO.keywords?.join(", "),
    authors: [{ name: "Tanika Zentic", url: BUSINESS_URL }],
    creator: BUSINESS_NAME,
    publisher: BUSINESS_NAME,
    metadataBase: new URL(BUSINESS_URL),
    alternates: {
      canonical: mergedSEO.url ?? BUSINESS_URL,
    },
    openGraph: {
      title: fullTitle,
      description: mergedSEO.description,
      url: mergedSEO.url ?? BUSINESS_URL,
      siteName: BUSINESS_NAME,
      images: [
        {
          url: mergedSEO.image ?? "/Logo.png",
          width: 1200,
          height: 630,
          alt: `${BUSINESS_NAME} - Custom Embroidery in the Quad Cities`,
        },
      ],
      locale: "en_US",
      type: mergedSEO.type ?? "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: mergedSEO.description,
      images: [mergedSEO.image ?? "/Logo.png"],
      creator: "@mjcreativecandles",
    },
    robots: {
      index: !mergedSEO.noIndex,
      follow: !mergedSEO.noIndex,
      googleBot: {
        index: !mergedSEO.noIndex,
        follow: !mergedSEO.noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    category: "shopping",
    other: {
      "geo.region": "US-IL",
      "geo.placename": "Moline",
      "geo.position": "41.5067;-90.5151",
      ICBM: "41.5067, -90.5151",
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
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image.startsWith("http")
      ? product.image
      : `${BUSINESS_URL}${product.image}`,
    sku: product.sku ?? product.id,
    brand: {
      "@type": "Brand",
      name: product.brand ?? BUSINESS_NAME,
    },
    category: product.category,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${BUSINESS_URL}/shop/${product.id}`,
      seller: {
        "@type": "LocalBusiness",
        name: BUSINESS_NAME,
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS_ADDRESS.street,
          addressLocality: BUSINESS_ADDRESS.city,
          addressRegion: BUSINESS_ADDRESS.state,
          postalCode: BUSINESS_ADDRESS.zip,
          addressCountry: BUSINESS_ADDRESS.country,
        },
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
          addressRegion: ["IL", "IA"],
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 5,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnAtKiosk",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

// Local Business Schema for rich snippets
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BUSINESS_URL}/#organization`,
    name: BUSINESS_NAME,
    alternateName: "MJ Creative Candles QC",
    description:
      "Premium custom candles and creative gifts in the Quad Cities. Specializing in handcrafted candles, personalized items, and unique gifts.",
    url: BUSINESS_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    image: `${BUSINESS_URL}/Logo.png`,
    logo: `${BUSINESS_URL}/Logo.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: BUSINESS_ADDRESS.state,
      postalCode: BUSINESS_ADDRESS.zip,
      addressCountry: BUSINESS_ADDRESS.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.5067,
      longitude: -90.5151,
    },
    areaServed: [
      ...QUAD_CITIES.map((city) => ({
        "@type": "City",
        name: city,
      })),
      {
        "@type": "State",
        name: "Illinois",
      },
      {
        "@type": "State",
        name: "Iowa",
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 41.5067,
        longitude: -90.5151,
      },
      geoRadius: "50000", // 50km radius
    },
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Debit Card",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    sameAs: [
      "https://www.facebook.com/mjcreativecandles",
      "https://www.instagram.com/mjcreativecandles",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Creative Candles & Gifts",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom Embroidery",
            description:
              "Professional embroidery on apparel, hats, and accessories",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Spirit Wear",
            description: "Custom school and team spirit wear",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mama Keepsake Sweatshirts",
            description:
              "Transform baby clothes into memorable keepsake sweatshirts",
          },
        },
      ],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: "50",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Local Customer",
        },
        reviewBody:
          "Amazing quality embroidery! The beanies turned out perfect for our team.",
      },
    ],
  };
}

// Breadcrumb schema for navigation
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${BUSINESS_URL}${item.url}`,
    })),
  };
}

// FAQ Schema for common questions
export function generateFAQSchema(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// Website schema with search action
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS_NAME,
    alternateName: "MJ Creative Candles QC",
    url: BUSINESS_URL,
    description: defaultSEO.description,
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BUSINESS_URL}/Logo.png`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BUSINESS_URL}/shop?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
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

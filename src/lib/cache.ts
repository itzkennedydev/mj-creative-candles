// Enhanced caching configuration
export const cacheConfig = {
  // Static assets cache for 1 year
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
  },
  
  // API responses cache for 5 minutes
  api: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300,
  },
  
  // Images cache for 1 month
  images: {
    maxAge: 2592000, // 30 days
    sMaxAge: 2592000,
  },
  
  // HTML pages cache for 1 hour
  pages: {
    maxAge: 3600, // 1 hour
    sMaxAge: 3600,
  },
};

// Cache-Control headers helper
export function getCacheHeaders(type: keyof typeof cacheConfig) {
  const config = cacheConfig[type];
  return {
    'Cache-Control': `public, max-age=${config.maxAge}, s-maxage=${config.sMaxAge}`,
  };
}

// ETag generation for cache validation
export function generateETag(content: string): string {
  return `"${Buffer.from(content).toString('base64').slice(0, 16)}"`;
}

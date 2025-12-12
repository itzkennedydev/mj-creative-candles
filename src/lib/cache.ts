// Enhanced caching configuration with stale-while-revalidate
interface CacheConfig {
  maxAge: number;
  sMaxAge: number;
  staleWhileRevalidate?: number;
  immutable?: boolean;
  private?: boolean;
}

export const cacheConfig: Record<string, CacheConfig> = {
  // Static assets cache for 1 year (immutable)
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    staleWhileRevalidate: 0, // Immutable, no revalidation needed
    immutable: true,
  },

  // Product data - frequently accessed, moderate revalidation
  products: {
    maxAge: 300, // 5 minutes client cache
    sMaxAge: 300, // 5 minutes CDN cache
    staleWhileRevalidate: 3600, // Serve stale for 1 hour while revalidating
  },

  // Product detail - longer cache since less frequently updated
  productDetail: {
    maxAge: 600, // 10 minutes client cache
    sMaxAge: 600, // 10 minutes CDN cache
    staleWhileRevalidate: 7200, // Serve stale for 2 hours while revalidating
  },

  // Images cache for 1 month with revalidation
  images: {
    maxAge: 2592000, // 30 days
    sMaxAge: 2592000,
    staleWhileRevalidate: 2592000, // Another 30 days stale
    immutable: false,
  },

  // HTML pages cache for 1 hour with ISR
  pages: {
    maxAge: 300, // 5 minutes client
    sMaxAge: 3600, // 1 hour CDN
    staleWhileRevalidate: 86400, // 24 hours stale while revalidating
  },

  // Reviews - moderate caching
  reviews: {
    maxAge: 60, // 1 minute client
    sMaxAge: 300, // 5 minutes CDN
    staleWhileRevalidate: 1800, // 30 minutes stale
  },

  // Orders - short cache, private
  orders: {
    maxAge: 0, // No client cache
    sMaxAge: 10, // 10 seconds CDN
    staleWhileRevalidate: 30, // 30 seconds stale
    private: true,
  },

  // Analytics - longer cache for admin data
  analytics: {
    maxAge: 60, // 1 minute
    sMaxAge: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes stale
    private: true,
  },

  // Settings - long cache, rarely changes
  settings: {
    maxAge: 600, // 10 minutes
    sMaxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours stale
  },
};

// Cache-Control headers helper with stale-while-revalidate
export function getCacheHeaders(type: string) {
  const config = cacheConfig[type];
  if (!config) {
    throw new Error(`Unknown cache type: ${type}`);
  }

  const directives = [
    config.private ? "private" : "public",
    `max-age=${config.maxAge}`,
    `s-maxage=${config.sMaxAge}`,
  ];

  if (
    config.staleWhileRevalidate !== undefined &&
    config.staleWhileRevalidate > 0
  ) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  if (config.immutable) {
    directives.push("immutable");
  }

  return {
    "Cache-Control": directives.join(", "),
  };
}

// ETag generation for cache validation
export function generateETag(content: string): string {
  return `"${Buffer.from(content).toString("base64").slice(0, 16)}"`;
}

// In-memory cache for server-side data (MongoDB queries)
class MemoryCache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();

  set(key: string, data: any, ttl: number = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  // Clear entries older than their TTL
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Cleanup stale cache entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000);
}

// React Query cache times (in milliseconds)
export const queryCache = {
  products: {
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  },
  productDetail: {
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 60 * 60 * 1000, // 1 hour in cache
  },
  reviews: {
    staleTime: 1 * 60 * 1000, // 1 minute fresh
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  },
  orders: {
    staleTime: 30 * 1000, // 30 seconds fresh
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
  },
  analytics: {
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
  },
};

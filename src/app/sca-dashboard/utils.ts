/**
 * Utility functions required by SCA Dashboard components
 * Copy these to your project or provide equivalents
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type React from "react";

/**
 * App domain - update with your actual domain
 */
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "localhost:3000";

/**
 * Google Favicon API URL
 */
export const GOOGLE_FAVICON_URL = "https://www.google.com/s2/favicons?domain=";

/**
 * Default pagination limit
 */
export const PAGINATION_LIMIT = 10;

/**
 * Hostname sets for different subdomains
 * Update these with your actual hostnames if needed
 */
export const APP_HOSTNAMES = new Set<string>([
  "app.localhost",
  "app.example.com",
]);

export const PARTNERS_HOSTNAMES = new Set<string>([
  "partners.localhost",
  "partners.example.com",
]);

export const ADMIN_HOSTNAMES = new Set<string>([
  "admin.localhost",
  "admin.example.com",
]);

/**
 * Merge classnames with Tailwind conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Create a href with optional domain and query parameters
 */
export function createHref(
  path: string,
  domain?: string,
  params?: Record<string, string>
): string {
  const baseUrl = domain ? `https://${domain}` : "";
  const url = new URL(path, baseUrl || "http://localhost");
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.pathname + url.search;
}

/**
 * Get search params from URL string
 */
export function getSearchParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch {
    // If URL parsing fails, try to parse as query string
    const queryString = url.includes("?") ? (url.split("?")[1] ?? url) : url;
    queryString.split("&").forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    });
  }
  return params;
}

/**
 * Fetcher function for SWR
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format a number with K/M/B suffixes
 */
export function nFormatter(
  num: number,
  opts?: { digits?: number; full?: boolean }
): string {
  if (opts?.full) {
    return num.toLocaleString();
  }
  const digits = opts?.digits ?? 1;
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(digits).replace(/\.0$/, "") + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(digits).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(digits).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Format a number as currency
 */
export function currencyFormatter(
  num: number,
  currency: string = "USD"
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Deep equality check for objects
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Check if a click event occurred on an interactive child element
 */
export function isClickOnInteractiveChild(
  event: React.MouseEvent
): boolean {
  const target = event.target as HTMLElement;
  const interactiveElements = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
    "[role='button']",
    "[role='link']",
    "[tabindex]",
  ];
  return interactiveElements.some((selector) =>
    target.closest(selector)
  );
}

/**
 * Format a Date object to a human-readable string
 */
export function formatDateTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Relative time
  if (Math.abs(diffMins) < 1) {
    return "now";
  }
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minute${diffMins !== 1 ? "s" : ""}` : `${Math.abs(diffMins)} minute${Math.abs(diffMins) !== 1 ? "s" : ""} ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? "s" : ""} ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? "s" : ""}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? "s" : ""} ago`;
  }

  // Absolute time
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Get datetime-local input format from Date
 */
export function getDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse natural language datetime string to Date
 * Supports formats like "tomorrow at 5pm", "in 2 hours", "next week", etc.
 */
export function parseDateTime(input: string): Date | null {
  if (!input || input.trim().length === 0) {
    return null;
  }

  const now = new Date();
  const lowerInput = input.toLowerCase().trim();

  // Try parsing as ISO string first
  const isoDate = new Date(input);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Relative time patterns
  const relativePatterns = [
    // "in X minutes/hours/days"
    {
      pattern: /^in\s+(\d+)\s+(minute|minutes|min|mins|hour|hours|hr|hrs|day|days|d)$/i,
      handler: (match: RegExpMatchArray) => {
        const value = parseInt(match[1]!);
        const unit = match[2]!.toLowerCase();
        const result = new Date(now);
        if (unit.startsWith("min")) {
          result.setMinutes(result.getMinutes() + value);
        } else if (unit.startsWith("hour") || unit.startsWith("hr")) {
          result.setHours(result.getHours() + value);
        } else if (unit.startsWith("day") || unit === "d") {
          result.setDate(result.getDate() + value);
        }
        return result;
      },
    },
    // "tomorrow", "today", "yesterday"
    {
      pattern: /^(tomorrow|today|yesterday)(\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?$/i,
      handler: (match: RegExpMatchArray) => {
        const day = match[1]!.toLowerCase();
        const timeStr = match[3];
        const result = new Date(now);
        
        if (day === "tomorrow") {
          result.setDate(result.getDate() + 1);
        } else if (day === "yesterday") {
          result.setDate(result.getDate() - 1);
        }
        
        if (timeStr) {
          let hours = parseInt(timeStr);
          const minutes = match[4] ? parseInt(match[4]) : 0;
          const ampm = match[5]?.toLowerCase();
          
          if (ampm === "pm" && hours !== 12) {
            hours += 12;
          } else if (ampm === "am" && hours === 12) {
            hours = 0;
          }
          
          result.setHours(hours, minutes, 0, 0);
        } else {
          result.setHours(0, 0, 0, 0);
        }
        
        return result;
      },
    },
    // "next week", "next month"
    {
      pattern: /^next\s+(week|month|year)$/i,
      handler: (match: RegExpMatchArray) => {
        const unit = match[1]!.toLowerCase();
        const result = new Date(now);
        if (unit === "week") {
          result.setDate(result.getDate() + 7);
        } else if (unit === "month") {
          result.setMonth(result.getMonth() + 1);
        } else if (unit === "year") {
          result.setFullYear(result.getFullYear() + 1);
        }
        return result;
      },
    },
  ];

  for (const { pattern, handler } of relativePatterns) {
    const match = lowerInput.match(pattern);
    if (match) {
      try {
        return handler(match);
      } catch {
        // Continue to next pattern
      }
    }
  }

  // Try standard date parsing as fallback
  const parsed = new Date(input);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

/**
 * Get domain from URL without www prefix
 */
export function getDomainWithoutWWW(url: string): string {
  if (!url) return "";
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    let hostname = urlObj.hostname;
    // Remove www. prefix
    if (hostname.startsWith("www.")) {
      hostname = hostname.slice(4);
    }
    return hostname;
  } catch {
    // If URL parsing fails, try to extract domain manually
    let domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    domain = domain.split("/")[0]?.split("?")[0]?.split("#")[0] || "";
    return domain;
  }
}

/**
 * Get valid URL from string, adding protocol if needed
 */
export function getUrlFromString(str: string): string {
  if (!str) return "";
  // If it already has a protocol, return as is
  if (str.startsWith("http://") || str.startsWith("https://")) {
    try {
      new URL(str);
      return str;
    } catch {
      return "";
    }
  }
  // Try adding https://
  try {
    const url = `https://${str}`;
    new URL(url);
    return url;
  } catch {
    return "";
  }
}

/**
 * Resize an image file to target resolution
 * Returns a Promise that resolves to a data URL
 */
export function resizeImage(
  file: File,
  targetResolution: { width: number; height: number }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = targetResolution.width;
        canvas.height = targetResolution.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, targetResolution.width, targetResolution.height);
        resolve(canvas.toDataURL(file.type, 0.9));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Stable sort - maintains relative order of equal elements
 */
export function stableSort<T>(
  array: T[],
  compareFn?: (a: T, b: T) => number
): T[] {
  const indexed = array.map((item, index) => ({ item, index }));
  indexed.sort((a, b) => {
    if (compareFn) {
      const result = compareFn(a.item, b.item);
      if (result !== 0) return result;
    }
    // Maintain original order for equal elements
    return a.index - b.index;
  });
  return indexed.map(({ item }) => item);
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}


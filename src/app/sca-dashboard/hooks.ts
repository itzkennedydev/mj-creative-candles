/**
 * React hooks required by SCA Dashboard components
 */

import { useEffect, useState, useCallback } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

/**
 * Media query hook for responsive design
 */
function getDevice(): "mobile" | "tablet" | "desktop" | null {
  if (typeof window === "undefined") return null;

  return window.matchMedia("(min-width: 1024px)").matches
    ? "desktop"
    : window.matchMedia("(min-width: 640px)").matches
      ? "tablet"
      : "mobile";
}

function getDimensions() {
  if (typeof window === "undefined") return null;

  return { width: window.innerWidth, height: window.innerHeight };
}

export function useMediaQuery() {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop" | null>(
    getDevice(),
  );
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(getDimensions());

  useEffect(() => {
    const checkDevice = () => {
      setDevice(getDevice());
      setDimensions(getDimensions());
    };

    // Initial detection
    checkDevice();

    // Listener for windows resize
    window.addEventListener("resize", checkDevice);

    // Cleanup listener
    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return {
    device,
    width: dimensions?.width,
    height: dimensions?.height,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };
}

/**
 * Router utilities hook
 */
export function useRouterStuff() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsObj = Object.fromEntries(searchParams);

  const getQueryString = (
    kv?: Record<string, any>,
    opts?: {
      include?: string[];
      exclude?: string[];
    },
  ) => {
    let newParams = new URLSearchParams(searchParams);
    if (opts?.include && Array.isArray(opts.include)) {
      const filteredParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (opts.include?.includes(key)) {
          filteredParams.set(key, value);
        }
      });
      newParams = filteredParams;
    }
    if (opts?.exclude && Array.isArray(opts.exclude)) {
      opts.exclude.forEach((k) => newParams.delete(k));
    }
    if (kv) {
      Object.entries(kv).forEach(([k, v]) => newParams.set(k, v));
    }
    const queryString = newParams.toString();
    return queryString.length > 0 ? `?${queryString}` : "";
  };

  const queryParams = useCallback(
    ({
      set,
      del,
      replace,
      scroll = true,
      getNewPath,
      arrayDelimiter = ",",
    }: {
      set?: Record<string, string | string[]>;
      del?: string | string[];
      replace?: boolean;
      scroll?: boolean;
      getNewPath?: boolean;
      arrayDelimiter?: string;
    }) => {
      const newParams = new URLSearchParams(searchParams);
      if (set) {
        Object.entries(set).forEach(([k, v]) =>
          newParams.set(k, Array.isArray(v) ? v.join(arrayDelimiter) : v),
        );
      }
      if (del) {
        if (Array.isArray(del)) {
          del.forEach((k) => newParams.delete(k));
        } else {
          newParams.delete(del);
        }
      }
      const queryString = newParams.toString();
      const newPath = `${pathname}${
        queryString.length > 0 ? `?${queryString}` : ""
      }`;
      if (getNewPath) return newPath;
      if (replace) {
        router.replace(newPath, { scroll: false });
      } else {
        router.push(newPath, { scroll });
      }
    },
    [searchParams, pathname, router],
  );

  return {
    pathname: pathname as string,
    router: router as AppRouterInstance,
    searchParams: searchParams as ReadonlyURLSearchParams,
    searchParamsObj,
    queryParams,
    getQueryString,
  };
}

/**
 * Local storage hook
 */
function getItemFromLocalStorage(key: string) {
  if (typeof window === "undefined") return null;

  const item = window.localStorage.getItem(key);
  if (item) return JSON.parse(item);

  return null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState(
    getItemFromLocalStorage(key) ?? initialValue,
  );

  useEffect(() => {
    // Retrieve from localStorage
    const item = getItemFromLocalStorage(key);
    if (item) setStoredValue(item);
  }, [key]);

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value);
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}


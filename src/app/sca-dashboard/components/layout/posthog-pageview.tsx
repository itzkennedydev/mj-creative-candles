import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export function PosthogPageview() {
  return (
    <Suspense>
      <PosthogPageviewClient />
    </Suspense>
  );
}

const PosthogPageviewClient = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // PostHog integration disabled - package not installed
    // Track pageviews placeholder
    if (pathname) {
      // Future PostHog integration can be added here
    }
  }, [pathname, searchParams]);

  return null;
};

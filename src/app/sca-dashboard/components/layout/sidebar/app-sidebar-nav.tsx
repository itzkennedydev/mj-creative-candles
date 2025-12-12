"use client";

import { getPlanCapabilities } from "../../../plan-capabilities";
import { useRouterStuff } from "../../../hooks";
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Store,
  Image,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { Compass } from "./icons/compass";
import { LinesY } from "./icons/lines-y";
import { SidebarNav, SidebarNavAreas, SidebarNavGroups } from "./sidebar-nav";
import { createAnimatedIcon } from "./icons/animated-icon";

// Create animated versions of the icons
const AnimatedShoppingCart = createAnimatedIcon(ShoppingCart, "rotate");
const AnimatedPackage = createAnimatedIcon(Package, "rotate");
const AnimatedUsers = createAnimatedIcon(Users, "rotate");
const AnimatedBarChart3 = createAnimatedIcon(BarChart3, "rotate");
const AnimatedStore = createAnimatedIcon(Store, "rotate");
const AnimatedImage = createAnimatedIcon(Image, "rotate");
type SidebarNavData = {
  pathname: string;
  queryString: string;
};

const FIVE_YEARS_SECONDS = 60 * 60 * 24 * 365 * 5;

const NAV_GROUPS: SidebarNavGroups<SidebarNavData> = ({ pathname }) => [
  {
    name: "Overview & Insights",
    description: "Analytics, customers, and insights.",
    icon: Compass,
    href: `/admin`,
    active:
      pathname === `/admin` ||
      pathname?.startsWith(`/admin/analytics`) ||
      pathname?.startsWith(`/admin/customers`),
  },
  {
    name: "Marketplace",
    description: "Manage orders and products.",
    icon: AnimatedStore,
    href: `/admin/orders`,
    active:
      pathname?.startsWith(`/admin/orders`) ||
      pathname?.startsWith(`/admin/products`),
  },
];

const NAV_AREAS: SidebarNavAreas<SidebarNavData> = {
  // Dashboard area - only shows Dashboard items
  dashboard: ({ pathname, queryString }) => ({
    title: "Overview & Insights",
    description: "Analytics, customers, and insights.",
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Overview",
            icon: Compass,
            href: `/admin`,
            exact: true,
          },
          {
            name: "Analytics",
            icon: AnimatedBarChart3,
            href: `/admin/analytics`,
          },
          {
            name: "Customers",
            icon: AnimatedUsers,
            href: `/admin/customers`,
            exact: true,
          },
        ],
      },
    ],
  }),

  // Marketplace area - only shows Marketplace items
  marketplace: ({ pathname, queryString }) => ({
    title: "Sales & Operations",
    description: "Manage orders and products.",
    direction: "left",
    content: [
      {
        items: [
          {
            name: "Orders",
            icon: AnimatedShoppingCart,
            href: `/admin/orders`,
            exact: true,
          },
          {
            name: "Products",
            icon: AnimatedPackage,
            href: `/admin/products`,
            exact: true,
          },
          {
            name: "Image Library",
            icon: AnimatedImage,
            href: `/admin/image-library`,
            exact: true,
          },
        ],
      },
    ],
  }),
};

export function AppSidebarNav({ toolContent }: { toolContent?: ReactNode }) {
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();

  // Static mode - no auth or data fetching
  const plan = "free";

  const currentArea = useMemo(() => {
    // Don't show secondary sidebar for help and settings pages
    if (
      pathname?.startsWith(`/admin/help`) ||
      pathname?.startsWith(`/admin/settings`)
    ) {
      return null;
    }
    // Show marketplace area for orders and products
    if (
      pathname?.startsWith(`/admin/orders`) ||
      pathname?.startsWith(`/admin/products`) ||
      pathname?.startsWith(`/admin/image-library`)
    ) {
      return "marketplace";
    }
    // Show dashboard area for admin pages (analytics, customers, overview)
    if (
      pathname === `/admin` ||
      pathname?.startsWith(`/admin/analytics`) ||
      pathname?.startsWith(`/admin/customers`)
    ) {
      return "dashboard";
    }
    // Default to dashboard
    return "dashboard";
  }, [pathname]);

  const { canTrackConversions } = getPlanCapabilities(plan);

  return (
    <SidebarNav
      groups={NAV_GROUPS}
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        pathname,
        queryString: getQueryString(undefined, {
          include: ["folderId", "tagIds"],
        }),
      }}
      toolContent={toolContent}
    />
  );
}

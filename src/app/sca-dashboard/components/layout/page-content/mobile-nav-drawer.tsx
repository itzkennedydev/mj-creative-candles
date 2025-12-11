"use client";

import { Drawer } from "vaul";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Compass, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package,
} from "lucide-react";
import { cn } from "@sca/utils";

interface MobileNavDrawerProps {
  title: string;
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Overview",
    href: "/admin",
    icon: Compass,
    exact: true,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
    exact: true,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
    exact: true,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    exact: true,
  },
];

export function MobileNavDrawer({ title, children }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleItemClick = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-bg-subtle fixed inset-0 z-50 bg-opacity-10 backdrop-blur" />
        <Drawer.Content
          className="border-border-subtle bg-bg-default fixed bottom-0 left-0 right-0 z-50 mt-24 rounded-t-[10px] border-t"
          onPointerDownOutside={(e) => {
            // Prevent dismissal when clicking inside a toast
            if (
              e.target instanceof Element &&
              e.target.closest("[data-sonner-toast]")
            ) {
              e.preventDefault();
            }
          }}
        >
          <div className="sticky top-0 z-20 flex w-full items-center justify-center rounded-t-[10px] bg-inherit">
            <div className="bg-border-default my-3 h-1 w-12 rounded-full" />
          </div>
          <div className="bg-bg-default flex min-h-[150px] w-full items-center justify-center overflow-hidden pb-8 align-middle shadow-xl">
            <div className="overflow-hidden pointer-events-auto" style={{ transform: "translateZ(0px)", width: "auto", height: "auto" }}>
              <div className="h-max">
                <div className="flex items-center overflow-hidden rounded-t-lg border-b border-neutral-200">
                  <input
                    placeholder="Search folders..."
                    className="grow border-0 py-3 pl-4 pr-2 outline-none placeholder:text-neutral-400 focus:ring-0 sm:text-sm"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    type="text"
                    readOnly
                  />
                  <div className="mr-2">
                    <a
                      className="rounded-md border border-neutral-200 px-2 py-1 text-xs transition-colors hover:bg-neutral-100"
                      href="#"
                    >
                      View All
                    </a>
                  </div>
                </div>
                <div className="relative">
                  <div className="scrollbar-hide h-full w-screen overflow-y-scroll [clip-path:inset(0)] sm:w-auto max-h-[min(50vh,250px)]">
                    <div className="flex w-full min-w-[100px] flex-col gap-1 p-1">
                      {navigationItems.map((item) => {
                        const isActive = item.exact
                          ? pathname === item.href
                          : pathname?.startsWith(item.href);
                        const Icon = item.icon;
                        
                        return (
                          <button
                            key={item.href}
                            onClick={() => handleItemClick(item.href)}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-100 md:min-w-[250px]",
                              isActive && "bg-neutral-100"
                            )}
                            data-selected={isActive}
                            role="option"
                            aria-selected={isActive}
                            aria-disabled="false"
                          >
                            <div className="flex min-w-0 grow items-center gap-2">
                              <span className="shrink-0 text-neutral-600">
                                <div className="border rounded-md border-green-200 bg-green-100 mr-1">
                                  <div className="rounded-md p-1 bg-green-100">
                                    <Icon className="size-4 text-[#166534]" />
                                  </div>
                                </div>
                              </span>
                              <span className="grow truncate">{item.name}</span>
                            </div>
                            {isActive && (
                              <svg
                                height="18"
                                width="18"
                                viewBox="0 0 18 18"
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-4 shrink-0 text-neutral-600"
                              >
                                <g fill="currentColor">
                                  <path
                                    d="M6.5,14c-.192,0-.384-.073-.53-.22l-3.75-3.75c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l3.22,3.22L14.72,3.97c.293-.293,.768-.293,1.061,0s.293,.768,0,1.061L7.03,13.78c-.146,.146-.338,.22-.53,.22Z"
                                    fill="currentColor"
                                  />
                                </g>
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}


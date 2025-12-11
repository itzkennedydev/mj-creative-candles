"use client";

import {
  Popover,
} from "@sca/ui";
import { cn } from "@sca/utils";
import {
  useEffect,
  useState,
} from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { sha256 } from "js-sha256";

export function UserDropdown() {
  const router = useRouter();
  const [openPopover, setOpenPopover] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get email from sessionStorage immediately
    const storedEmail = sessionStorage.getItem("adminEmail");
    setEmail(storedEmail);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // Clear all session storage
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminEmail");
    sessionStorage.removeItem("adminRefreshToken");
    // Close popover
    setOpenPopover(false);
    // Redirect to login
    router.push("/admin/login");
  };

  // Generate avatar URL from email using grounded profile style
  const getAvatarUrl = (email: string) => {
    const emailHash = sha256(email);
    return `https://avatar.vercel.sh/${emailHash}`;
  };

  return (
    <Popover
      content={
        <div className="flex w-full flex-col space-y-px rounded-md bg-white p-2 sm:min-w-56">
          {isLoading ? (
            <div className="grid gap-2 px-2 py-3">
              <div className="h-3 w-12 animate-pulse rounded-full bg-neutral-200" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-neutral-200" />
            </div>
          ) : email ? (
            <>
              <div className="p-2">
                <p className="truncate text-sm font-medium text-black">
                  {email}
                </p>
              </div>
              <div className="border-t border-neutral-200"></div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 active:bg-neutral-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="p-2">
              <p className="text-sm text-neutral-500">Not logged in</p>
            </div>
          )}
        </div>
      }
      align="start"
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
      mobileOnly={false}
      popoverContentClassName=""
      onOpenAutoFocus={() => {}}
      collisionBoundary={undefined}
      sticky="partial"
      onEscapeKeyDown={() => {}}
      onWheel={() => {}}
    >
      <button
        onClick={() => {
          // Ensure email is loaded before opening
          if (!email && !isLoading) {
            const storedEmail = sessionStorage.getItem("adminEmail");
            setEmail(storedEmail);
          }
          setOpenPopover(!openPopover);
        }}
        className={cn(
          "animate-fade-in hover:bg-bg-inverted/5 active:bg-bg-inverted/10 flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
          "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
          openPopover && "bg-bg-inverted/10",
        )}
      >
        {isLoading ? (
          <div className="size-7 flex-none shrink-0 overflow-hidden rounded-full animate-pulse bg-neutral-200" />
        ) : email ? (
          <div className="size-7 flex-none shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
            <img
              src={getAvatarUrl(email)}
              alt={email}
              className="size-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If image fails to load, show gradient background
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="size-7 flex-none shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" />
        )}
      </button>
    </Popover>
  );
}

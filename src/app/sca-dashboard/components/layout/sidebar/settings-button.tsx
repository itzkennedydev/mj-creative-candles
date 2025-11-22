"use client";

import { Settings } from "lucide-react";
import { cn } from "../../../utils";
import Link from "next/link";

export function SettingsButton() {
  return (
    <Link
      href="/admin/settings"
      className={cn(
        "animate-fade-in hover:bg-bg-inverted/5 active:bg-bg-inverted/10 flex size-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
      )}
    >
      <Settings className="text-content-default size-5" />
    </Link>
  );
}


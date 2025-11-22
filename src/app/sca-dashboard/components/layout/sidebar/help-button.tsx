"use client";

import { CircleQuestion } from "../../ui/icons";
import Link from "next/link";

export function HelpButton() {
  return (
    <Link
      href="/admin/help"
      className="text-content-default hover:bg-bg-inverted/5 flex size-11 shrink-0 items-center justify-center rounded-lg"
    >
      <CircleQuestion className="size-5" strokeWidth={2} />
    </Link>
  );
}

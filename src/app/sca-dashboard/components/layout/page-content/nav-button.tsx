"use client";

import { useContext } from "react";
import { SideNavContext } from "../main-nav";

export function NavButton() {
  const { isOpen, setIsOpen } = useContext(SideNavContext);

  return (
    <button
      type="button"
      onClick={() => setIsOpen((o) => !o)}
      className="group flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm transition-all border-transparent text-content-default hover:bg-bg-subtle h-auto w-fit p-1 md:hidden"
      aria-label="Toggle sidebar"
    >
      <svg height="18" width="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="size-4">
        <g fill="currentColor">
          <path d="M4,2.75H14.25c1.105,0,2,.895,2,2V13.25c0,1.105-.895,2-2,2H4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
          <rect height="12.5" width="4.5" fill="none" rx="2" ry="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" x="1.75" y="2.75"></rect>
        </g>
      </svg>
    </button>
  );
}

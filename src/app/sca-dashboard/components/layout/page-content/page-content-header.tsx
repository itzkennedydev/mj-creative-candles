import { InfoTooltip } from "@sca/ui";
import { cn } from "@sca/utils";
import { ChevronLeft, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { NavButton } from "./nav-button";
import { MobileNavDrawer } from "./mobile-nav-drawer";

export type PageContentHeaderProps = {
  title?: ReactNode;
  titleInfo?: ReactNode | { title: string; href?: string };
  titleBackHref?: string;
  controls?: ReactNode;
  headerContent?: ReactNode;
};

export function PageContentHeader({
  title,
  titleInfo,
  titleBackHref,
  controls,
  headerContent,
}: PageContentHeaderProps) {
  // Generate titleInfo from object if provided
  const finalTitleInfo =
    titleInfo && typeof titleInfo === "object" && "title" in titleInfo ? (
      <InfoTooltip
        content={
          titleInfo.href
            ? `${titleInfo.title} [Learn more](${titleInfo.href})`
            : titleInfo.title
        }
      />
    ) : (
      titleInfo
    );

  const hasHeaderContent = !!(title || controls || headerContent);

  return (
    <div className={cn("border-border-subtle", hasHeaderContent && "border-b")}>
      <div className="@container/page mx-auto w-full max-w-screen-xl px-3 lg:px-6">
        <div
          className={cn(
            "flex h-12 items-center justify-between gap-4",
            hasHeaderContent ? "sm:h-16" : "sm:h-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-4">
            <NavButton />
            {title && (
              <div className="flex min-w-0 items-center gap-2">
                {titleBackHref && (
                  <Link
                    href={titleBackHref}
                    className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <ChevronLeft className="size-5" />
                  </Link>
                )}
                <h1 className="text-content-emphasis min-w-0 text-lg font-semibold leading-7">
                  <div className="-ml-2 sm:ml-0">
                    <MobileNavDrawer title={typeof title === "string" ? title : "Dashboard"}>
                      <button
                        type="button"
                        className="group h-auto justify-center whitespace-nowrap text-sm text-content-emphasis focus-visible:border-border-emphasis outline-none sm:hidden group items-center rounded-lg px-1 py-1 w-fit border-none !ring-0 bg-transparent transition-all hover:bg-transparent active:bg-transparent data-[state=open]:bg-transparent flex gap-2"
                        aria-haspopup="dialog"
                        aria-expanded="false"
                      >
                        <div className="min-w-0 truncate text-left text-lg font-semibold leading-7 text-content-emphasis w-full flex items-center justify-start">
                          <div className="min-w-0 grow truncate text-left">{title}</div>
                          <ChevronsUpDown className="ml-2 size-4 shrink-0 text-neutral-400" />
                        </div>
                      </button>
                    </MobileNavDrawer>
                  </div>
                  <span className="hidden sm:inline">{title}</span>
                </h1>
                {finalTitleInfo}
              </div>
            )}
          </div>
          {controls && (
            <div className="flex items-center gap-2">{controls}</div>
          )}
        </div>
        {headerContent && <div className="pb-3 pt-1">{headerContent}</div>}
      </div>
    </div>
  );
}

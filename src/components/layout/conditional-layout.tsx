"use client";

import { usePathname } from "next/navigation";
import { Header } from "~/components/layout/header";
import { Footer } from "~/components/layout/footer";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const isComingSoonPage = pathname === "/coming-soon";

  if (isAdminPage || isComingSoonPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

/**
 * Route-level transition. Keyed on pathname so only real page changes animate —
 * query-string updates (filters, tabs, pagination) stay put.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  );
}

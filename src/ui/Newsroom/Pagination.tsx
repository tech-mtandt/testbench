import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { pageList } from "./data";
/** Numbered pagination (Links, so it works without JS). `href(n)` builds each page URL. */
export default function Pagination({ page, totalPages, href }: { page: number; totalPages: number; href: (n: number) => string }) {
  if (totalPages <= 1) return null;
  const step = "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium no-underline transition-colors";
  const arrow = (n: number, label: string, icon: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <span className={`${step} text-subtle opacity-50`} aria-hidden>
        {icon}
      </span>
    ) : (
      <Link href={href(n)} aria-label={label} className={`${step} border border-line bg-white text-ink hover:border-ink`}>
        {icon}
      </Link>
    );
  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-1.5 sm:gap-2">
      {arrow(page - 1, "Previous page", <ChevronLeft className="h-4 w-4" />, page <= 1)}
      <ol className="flex items-center gap-1 sm:gap-1.5">
        {pageList(page, totalPages).map((n, i) =>
          n === "…" ? (
            <li key={`gap-${i}`} className="w-6 text-center font-mono text-sm text-subtle" aria-hidden>
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                className={`${step} font-mono tabular ${n === page ? "bg-ink text-white" : "text-ink-2 hover:bg-white"}`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ol>
      {arrow(page + 1, "Next page", <ChevronRight className="h-4 w-4" />, page >= totalPages)}
    </nav>
  );
}

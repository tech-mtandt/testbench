"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import type { TocItem } from "./lib";
import { scrollToId } from "./SectionNav";

/** Sticky table of contents with scroll-spy for long documents. */
export default function LegalToc({ items }: { items: TocItem[] }) {
  const lenis = useLenis();
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const on = () => {
      let cur = items[0]?.id;
      for (const t of items) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top < 160) cur = t.id;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [items]);

  return (
    <nav aria-label="Contents">
      <p className="mb-3 font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">Contents</p>
      <ol className="space-y-0.5 border-l border-line">
        {items.map((t) => {
          const on = t.id === active;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  history.replaceState(null, "", `#${t.id}`);
                  scrollToId(t.id, lenis, 130);
                }}
                aria-current={on ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 ${t.sub ? "pl-7 text-[12.5px]" : "pl-4 text-[13px]"} leading-snug no-underline transition-colors ${
                  on ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

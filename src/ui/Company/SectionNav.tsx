"use client";

import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

export type NavSection = { id: string; label: string };

/** Offset that clears the floating header + this bar. */
const OFFSET = 150;

export function scrollToId(id: string, lenis?: { scrollTo: (t: HTMLElement, o?: { offset?: number; duration?: number }) => void } | null, offset = OFFSET) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -offset + 40, duration: 1.1 });
  else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset + 40, behavior: "smooth" });
}

/**
 * Sticky in-page navigation with scroll-spy. The active pill slides between items and
 * the strip auto-scrolls on mobile so the current section is always visible.
 */
export default function SectionNav({ sections, label = "On this page" }: { sections: NavSection[]; label?: string }) {
  const lenis = useLenis();
  const [active, setActive] = useState(sections[0]?.id);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let cur = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - OFFSET <= 0) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  useEffect(() => {
    const btn = strip.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    const box = strip.current;
    if (!btn || !box) return;
    const left = btn.offsetLeft - box.clientWidth / 2 + btn.clientWidth / 2;
    box.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label={label} className="sticky top-[76px] z-30 py-2 sm:top-[84px]">
      <div className="container-x">
        <div className="glass mx-auto flex max-w-fit min-w-0 items-center gap-1 rounded-full p-1 shadow-[var(--shadow-soft)]">
          <div ref={strip} className="no-scrollbar flex min-w-0 gap-0.5 overflow-x-auto" data-lenis-prevent>
            {sections.map((s) => {
              const on = s.id === active;
              return (
                <a
                  key={s.id}
                  data-id={s.id}
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    history.replaceState(null, "", `#${s.id}`);
                    scrollToId(s.id, lenis);
                  }}
                  className={`relative shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium whitespace-nowrap no-underline transition-colors ${
                    on ? "text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="company-section-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

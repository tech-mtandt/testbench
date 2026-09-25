"use client";

import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";

const OFFSET = 140;

/** Sticky in-page nav with scroll-spy. Sections are elements with the given ids. */
export default function SectionNav({ items, cta }: { items: { id: string; label: string }[]; cta?: ReactNode }) {
  const [active, setActive] = useState(items[0]?.id);
  const lenis = useLenis();

  // scroll-spy: the last section whose top has passed under the sticky bar
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      let cur = items[0]?.id;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top <= OFFSET + 24) cur = i.id;
      }
      setActive(cur);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const go = (id: string) => (e: MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    if (lenis) lenis.scrollTo(el, { offset: -OFFSET + 8 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - OFFSET + 8, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav aria-label="On this page" className="sticky top-[84px] z-30 border-y border-line bg-canvas/85 backdrop-blur-xl">
      <div className="container-x flex items-center gap-4">
        <ul className="no-scrollbar -mx-3 flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {items.map((i) => {
            const on = i.id === active;
            return (
              <li key={i.id} className="shrink-0">
                <a
                  href={`#${i.id}`}
                  onClick={go(i.id)}
                  aria-current={on ? "location" : undefined}
                  className={`relative flex h-12 items-center px-3 text-sm font-medium no-underline transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {i.label}
                  {on && (
                    <motion.span
                      layoutId="section-nav"
                      className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
        {cta && <div className="hidden shrink-0 md:block">{cta}</div>}
      </div>
    </nav>
  );
}

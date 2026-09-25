"use client";

import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useId, useState } from "react";

export type NavItem = { id: string; label: string };

/**
 * Sticky glass pill of in-page anchors with scroll-spy. Sits just under the fixed
 * header; sections it points at should carry `scroll-mt-40`.
 */
export default function OnPageNav({ items, action }: { items: NavItem[]; action?: React.ReactNode }) {
  const [active, setActive] = useState(items[0]?.id);
  const lenis = useLenis();
  const uid = useId();

  useEffect(() => {
    const els = items.map((it) => document.getElementById(it.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = Math.min(260, window.innerHeight * 0.35);
      let current = els[0].id;
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
      // Bottom of the page: the last section may be too short to reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1].id;
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    if (lenis) lenis.scrollTo(el, { offset: -150 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  if (items.length < 2) return null;
  return (
    <div className="sticky top-[76px] z-30 sm:top-[88px]">
      <div className="container-x">
        <nav
          aria-label="On this page"
          className="glass flex items-center gap-2 rounded-full p-1 shadow-[0_8px_24px_-16px_rgb(13_13_14/0.35)]"
        >
          <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto">
            {items.map((it) => {
              const on = it.id === active;
              return (
                <li key={it.id} className="shrink-0">
                  <a
                    href={`#${it.id}`}
                    onClick={(e) => go(e, it.id)}
                    aria-current={on ? "location" : undefined}
                    className={`relative flex h-10 items-center rounded-full px-4 text-[13px] font-medium no-underline transition-colors ${
                      on ? "text-white" : "text-muted hover:text-ink"
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId={`onpage-${uid}`}
                        className="absolute inset-0 rounded-full bg-ink"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative">{it.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          {action && <div className="hidden shrink-0 sm:block">{action}</div>}
        </nav>
      </div>
    </div>
  );
}

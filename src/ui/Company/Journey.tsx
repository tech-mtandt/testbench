"use client";

import { motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Img from "@/ui/Img";

export type Milestone = { year: string; title: string; text: string | null; image: string | null };

/**
 * Horizontal, scroll-snapped timeline. The year rail above tracks the card nearest the
 * left edge (animated indicator); clicking a year or the arrows scrolls the track.
 */
export default function Journey({ items }: { items: Milestone[] }) {
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const x = el.scrollLeft;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft - el.offsetLeft - x) < Math.abs(cards[best].offsetLeft - el.offsetLeft - x)) best = i;
    });
    const max = el.scrollWidth - el.clientWidth;
    if (max > 0 && x >= max - 4) best = cards.length - 1;
    setActive(best);
    setProgress(max > 0 ? x / max : 0);
  }, []);

  useEffect(() => {
    onScroll();
  }, [onScroll]);

  useEffect(() => {
    const btn = rail.current?.children[active] as HTMLElement | undefined;
    const box = rail.current;
    if (btn && box) box.scrollTo({ left: btn.offsetLeft - box.clientWidth / 2 + btn.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  const go = (i: number) => {
    const el = track.current;
    const c = el?.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined;
    if (el && c) el.scrollTo({ left: c.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  return (
    <div>
      {/* Year rail */}
      <div className="container-x">
        <div className="flex items-center gap-3">
          <div ref={rail} role="tablist" aria-label="Years" className="no-scrollbar relative flex min-w-0 flex-1 gap-1 overflow-x-auto" data-lenis-prevent>
            {items.map((m, i) => {
              const on = i === active;
              return (
                <button
                  key={m.year}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  onClick={() => go(i)}
                  className={`relative shrink-0 rounded-full px-3 py-2 font-mono text-[13px] tabular transition-colors ${on ? "text-ink" : "text-subtle hover:text-ink"}`}
                >
                  {on && (
                    <motion.span
                      layoutId="journey-year"
                      className="absolute inset-0 rounded-full bg-brand"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{m.year}</span>
                </button>
              );
            })}
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              aria-label="Previous milestone"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-white text-ink transition-colors hover:border-ink disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next milestone"
              onClick={() => go(active + 1)}
              disabled={active === items.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-ink-2 disabled:opacity-40"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="relative mt-4 h-px bg-line">
          <motion.div className="absolute inset-y-0 left-0 bg-ink" animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ duration: 0.3 }} />
        </div>
      </div>

      {/* Cards */}
      <div
        ref={track}
        onScroll={onScroll}
        data-lenis-prevent
        className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))] lg:px-[max(2.5rem,calc((100vw-1320px)/2+2.5rem))]"
      >
        {items.map((m, i) => {
          const on = i === active;
          return (
            <article
              key={m.year}
              className={`relative flex w-[78vw] max-w-[340px] shrink-0 snap-start flex-col overflow-hidden rounded-[var(--radius-card)] border p-6 transition-[background-color,border-color,color] duration-500 sm:w-[320px] ${
                on ? "border-graphite bg-graphite text-white" : "border-line bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <p className={`font-mono text-5xl font-medium tracking-[-0.04em] tabular ${on ? "text-brand" : "text-ink"}`}>{m.year}</p>
                {m.image && (
                  <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${on ? "bg-white" : "bg-canvas"}`}>
                    <Img src={m.image} alt="" className="max-h-11 max-w-12 object-contain mix-blend-multiply" />
                  </span>
                )}
              </div>
              <h3 className={`mt-8 text-lg leading-snug ${on ? "text-white" : ""}`}>{m.title}</h3>
              {m.text && <p className={`mt-2 text-sm leading-relaxed ${on ? "text-white/65" : "text-muted"}`}>{m.text}</p>}
              <p className={`mt-auto pt-6 font-mono text-[11px] ${on ? "text-white/40" : "text-subtle"}`}>
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

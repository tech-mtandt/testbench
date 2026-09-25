"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";

export type TabItem = { id: string; label: ReactNode; content: ReactNode; count?: number };

/** Underline tabs with an animated indicator and crossfading panels. */
export default function Tabs({ items, initial, className = "", sticky }: { items: TabItem[]; initial?: string; className?: string; sticky?: boolean }) {
  const [active, setActive] = useState(initial ?? items[0]?.id);
  const uid = useId();
  const current = items.find((t) => t.id === active) ?? items[0];
  if (!current) return null;
  return (
    <div className={className}>
      <div
        role="tablist"
        className={`no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0 ${sticky ? "sticky top-20 z-20 bg-canvas/90 backdrop-blur" : ""}`}
      >
        {items.map((t) => {
          const on = t.id === current.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls={`${uid}-${t.id}`}
              onClick={() => setActive(t.id)}
              className={`relative shrink-0 px-4 py-3.5 text-sm font-medium transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {t.label}
              {t.count !== undefined && <span className="ml-1.5 font-mono text-[11px] text-subtle">{t.count}</span>}
              {on && <motion.span layoutId={`tab-${uid}`} className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-ink" />}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          id={`${uid}-${current.id}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8"
        >
          {current.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

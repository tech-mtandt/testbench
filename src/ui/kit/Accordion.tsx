"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; meta?: ReactNode };

export default function Accordion({ items, multiple, defaultOpen, dark }: { items: AccordionItem[]; multiple?: boolean; defaultOpen?: string[]; dark?: boolean }) {
  const [open, setOpen] = useState<string[]>(defaultOpen ?? []);
  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={`divide-y border-y ${dark ? "divide-white/10 border-white/10" : "divide-line border-line"}`}>
      {items.map((it) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id}>
            <button
              type="button"
              aria-expanded={on}
              onClick={() => toggle(it.id)}
              className="flex w-full items-center gap-4 py-5 text-left"
            >
              <span className={`flex-1 text-base font-medium sm:text-lg ${dark ? "text-white" : "text-ink"}`}>{it.title}</span>
              {it.meta && <span className="hidden text-sm text-muted sm:block">{it.meta}</span>}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-500 ease-[var(--ease-out-expo)] ${
                  on ? "rotate-45 bg-brand text-ink" : dark ? "bg-white/10 text-white" : "bg-ink/5 text-ink"
                }`}
              >
                <Plus className="h-4 w-4" />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className={`pb-6 pr-12 ${dark ? "text-white/70" : "text-muted"}`}>{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

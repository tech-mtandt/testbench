"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Chip from "@/ui/kit/Chip";
import Img from "@/ui/Img";
import { Lightbox } from "./Gallery";

type Item = { image: string; title: string; caption: string; filters: string[] };

/** Project photo grid with filter chips (systems) — click to open the lightbox. */
export default function Showcase({ filters, items, title }: { filters: { id: string; label: string }[]; items: Item[]; title: string }) {
  const [f, setF] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const shown = f ? items.filter((i) => i.filters.includes(f)) : items;
  const usable = filters.filter((x) => items.some((i) => i.filters.includes(x.id)));
  return (
    <div>
      {usable.length > 1 && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={!f} onClick={() => setF(null)} count={items.length}>
            All
          </Chip>
          {usable.map((x) => (
            <Chip key={x.id} active={f === x.id} onClick={() => setF(x.id)} count={items.filter((i) => i.filters.includes(x.id)).length}>
              {x.label}
            </Chip>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((it, k) => (
            <motion.li
              key={it.image}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button type="button" onClick={() => setZoom(k)} className="group block w-full cursor-zoom-in text-left">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-line">
                  <Img
                    src={it.image}
                    alt={it.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                </span>
                <span className="mt-3 block text-[15px] font-medium text-ink">{it.title}</span>
                {it.caption && <span className="mt-0.5 block text-[13px] text-muted">{it.caption}</span>}
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Lightbox
        images={shown.map((i) => ({ src: i.image, alt: i.title, caption: i.caption }))}
        index={zoom}
        onIndex={setZoom}
        onClose={() => setZoom(null)}
        photo
        title={title}
      />
    </div>
  );
}

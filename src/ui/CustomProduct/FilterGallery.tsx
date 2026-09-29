"use client";

import { useState } from "react";
import Img from "@/ui/Img";
import Lightbox from "@/ui/CustomProduct/Lightbox";
import type { GalleryItem } from "@/content/custom";

type Props = { filters: { id: string; label: string }[]; items: GalleryItem[] };

export default function FilterGallery({ filters, items }: Props) {
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const shown = filter === "all" ? items : items.filter((i) => i.filters.includes(filter));

  return (
    <>
      <ul className="mb-6 flex flex-wrap gap-2">
        {[{ id: "all", label: "All" }, ...filters].map((f) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`px-3.5 py-1.5 text-sm uppercase transition-colors ${
                filter === f.id ? "bg-brand text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {shown.map((item) => (
          <button
            key={item.image}
            type="button"
            onClick={() => setOpen(shown.indexOf(item))}
            className="group relative aspect-square overflow-hidden border border-neutral-200 bg-white p-1 text-left"
            aria-label={item.title || "Open image"}
          >
            <Img src={item.image} alt={item.title} className="h-full w-full object-cover" />
            {(item.title || item.caption) && (
              <span className="absolute inset-1 flex flex-col justify-end bg-black/55 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-sm font-semibold">{item.title}</span>
                <span className="text-xs">{item.caption}</span>
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox
        images={shown.map((i) => ({ src: i.image, title: i.title, caption: i.caption }))}
        index={open}
        onChange={setOpen}
      />
    </>
  );
}

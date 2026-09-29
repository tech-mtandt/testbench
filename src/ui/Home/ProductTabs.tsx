"use client";

import Link from "next/link";
import { useState } from "react";
import Carousel from "@/ui/Carousel";
import Img from "@/ui/Img";
import { PlusIcon } from "@/ui/Icons";

export type ProductTab = {
  label: string;
  items: { title: string; image: string | null; href: string | null }[];
};

export default function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(0);
  const tab = tabs[active];

  return (
    <section className="default-margin py-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
        <h2 className="section-title shrink-0">Products</h2>
        <div role="tablist" className="no-scrollbar flex gap-1 overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`min-w-20 shrink-0 px-3 py-3 text-center text-xs leading-tight transition-colors ${
                i === active ? "bg-brand font-medium text-ink" : "text-ink-soft hover:bg-brand-cream"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Carousel key={active}>
        {tab.items.map((p) => {
          const card = (
            <>
              <div className="flex h-48 items-center justify-center p-4">
                <Img src={p.image ?? undefined} alt={p.title} className="max-h-full max-w-full object-contain" />
              </div>
              <h3 className="px-3 pb-8 text-center text-sm font-semibold uppercase tracking-wide">{p.title}</h3>
              <span className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-ink shadow">
                <PlusIcon className="h-4 w-4" />
              </span>
            </>
          );
          const cls =
            "relative mb-5 flex w-[70%] shrink-0 snap-start flex-col bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] no-underline sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]";
          // Most live cards open a modal instead of linking; fall back to a search.
          return (
            <Link key={p.title} href={p.href ?? `/search?q=${encodeURIComponent(p.title)}`} className={cls}>
              {card}
            </Link>
          );
        })}
      </Carousel>
    </section>
  );
}

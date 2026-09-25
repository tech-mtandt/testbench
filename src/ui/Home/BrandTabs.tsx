"use client";

import { useState } from "react";
import Img from "@/ui/Img";

export type BrandTab = {
  label: string;
  brands: { logo: string | null; alt: string; title: string; text: string; href: string | null }[];
};

export default function BrandTabs({ tabs }: { tabs: BrandTab[] }) {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-brand-cream py-12">
      <div className="default-margin">
        <h2 className="section-title">Our Brands</h2>
        <p className="mt-1 mb-6">Safety and Excellence in Meeting Diverse Need and Applications</p>
        <div role="tablist" className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              type="button"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`shrink-0 px-5 py-2.5 text-sm leading-tight transition-colors ${
                i === active ? "bg-black text-brand" : "text-ink hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {tabs[active].brands.map((b, i) => {
            const inner = (
              <>
                <div className="mb-4 flex h-16 items-center justify-center">
                  <Img src={b.logo ?? undefined} alt={b.alt || b.title} className="max-h-full max-w-[80%] object-contain" />
                </div>
                {b.title && <h5 className="mb-2 text-sm font-semibold uppercase">{b.title}</h5>}
                {b.text && <p className="text-xs leading-relaxed">{b.text}</p>}
              </>
            );
            const cls = "flex flex-col items-center rounded border border-neutral-200 bg-white p-5 text-center no-underline transition-shadow hover:shadow-lg";
            if (!b.href || b.href === "#") return <div key={i} className={cls}>{inner}</div>;
            const external = b.href.startsWith("http");
            return (
              <a key={i} href={b.href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

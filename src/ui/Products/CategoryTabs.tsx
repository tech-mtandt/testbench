"use client";

import Link from "next/link";
import { useState } from "react";
import Modal from "@/ui/Modal";
import type { Subcategory } from "@/content/products";
import Faqs from "./Faqs";

type Tab = Subcategory & { buyHref: string; rentHref: string };

export default function CategoryTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [choose, setChoose] = useState(false);
  const tab = tabs[active];

  return (
    <>
      <div role="tablist" className="no-scrollbar flex overflow-x-auto">
        {tabs.map((t, i) => (
          <button
            key={t.slug}
            role="tab"
            type="button"
            aria-selected={i === active}
            onClick={() => setActive(i)}
            className={`w-1/2 shrink-0 px-3 py-3 text-center text-sm transition-colors sm:w-1/3 ${
              i === active ? "bg-brand font-medium text-ink" : "text-ink hover:bg-brand-cream"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-4 bg-white p-5 shadow-[0_0_12px_rgba(0,0,0,0.08)] md:px-6 md:py-6">
        <div className="text-[15px] leading-relaxed text-ink [&_p]:text-ink [&_a]:text-ink [&_a]:no-underline [&_div]:min-h-4 [&_p]:mb-4">
          <div dangerouslySetInnerHTML={{ __html: tab.html }} />
        </div>

        {tab.button && (
          <div className="mt-2 flex justify-end md:pr-5">
            {tab.button.choose ? (
              <button type="button" onClick={() => setChoose(true)} className="btn-yellow text-xs">
                {tab.button.label}
              </button>
            ) : (
              <Link href={tab.button.href ?? tab.buyHref} className="btn-yellow text-xs no-underline">
                {tab.button.label}
              </Link>
            )}
          </div>
        )}

        {tab.faqs.length > 0 && (
          <div className="mt-6 rounded-lg bg-white shadow-[0_0_10px_rgba(0,0,0,0.06)]">
            <Faqs key={tab.slug} items={tab.faqs} />
          </div>
        )}
      </div>

      <Modal open={choose} onClose={() => setChoose(false)} title="Choose">
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Rental", href: tab.rentHref },
            { label: "Buy", href: tab.buyHref },
          ].map((o) => (
            <Link
              key={o.label}
              href={o.href}
              className="flex flex-col items-center gap-3 border border-neutral-200 p-6 text-ink no-underline transition-colors hover:border-brand hover:bg-brand-cream"
            >
              <TruckIcon className="h-10 w-10" />
              <span className="text-lg font-semibold">{o.label}</span>
            </Link>
          ))}
        </div>
      </Modal>
    </>
  );
}

const TruckIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden {...p}>
    <path d="M2 6h11v9H2zM13 9h4l3 3v3h-7z" strokeLinejoin="round" />
    <circle cx="6" cy="17" r="2" fill="white" />
    <circle cx="17" cy="17" r="2" fill="white" />
  </svg>
);

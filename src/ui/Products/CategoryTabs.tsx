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
  const tab = tabs[active] ?? tabs[0];
  if (!tab) return null;

  return (
    <>
      {/* Phones: swipeable strip (next tab peeks in); from sm up every tab is visible, wrapping as needed. */}
      <div role="tablist" className="tab-strip sm:grid sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
        {tabs.map((t, i) => (
          <button
            key={t.slug}
            id={`range-tab-${t.slug}`}
            role="tab"
            type="button"
            aria-selected={t === tab}
            onClick={() => setActive(i)}
            className={`w-[42%] shrink-0 px-3 py-3 text-center text-sm transition-colors sm:w-auto ${
              t === tab ? "bg-brand font-medium text-ink" : "text-ink hover:bg-brand-cream"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`range-tab-${tab.slug}`} className="mt-4 rounded-md bg-white p-5 shadow-[0_0_12px_rgba(0,0,0,0.08)] md:px-6 md:py-6">
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
              className="flex flex-col items-center gap-3 rounded-md border border-neutral-200 p-6 text-ink no-underline transition-colors hover:border-brand hover:bg-brand-cream"
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

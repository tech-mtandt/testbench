"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@/ui/Icons";
import type { Faq } from "@/content/products";

export default function Faqs({ items, title = "Frequently Asked Questions" }: { items: Faq[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="px-4 py-5 md:px-4">
      <h2 className="mb-3 text-xl font-bold text-ink md:text-2xl" style={{ fontFamily: "Arial, sans-serif" }}>
        {title}
      </h2>
      <div className="divide-y divide-neutral-200">
        {items.map((f, i) => (
          <div key={i}>
            <button
              type="button"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-sm text-ink"
            >
              <span>{f.q}</span>
              {open === i ? <MinusIcon className="h-4 w-4 shrink-0" /> : <PlusIcon className="h-4 w-4 shrink-0" />}
            </button>
            {open === i && (
              <div className="prose-legacy pb-4 text-sm" dangerouslySetInnerHTML={{ __html: f.a }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

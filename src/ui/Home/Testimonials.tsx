"use client";

import { useEffect, useState } from "react";
import Img from "@/ui/Img";
import { QuoteIcon } from "@/ui/Icons";

export type Testimonial = { quote: string; author: string; logo: string | null };

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 7000);
    return () => clearInterval(t);
  }, [items.length]);
  const t = items[i];
  if (!t) return null;

  return (
    <section className="bg-[#1b1d1f] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02)_0_2px,transparent_2px_6px)] py-12">
      <div className="default-margin max-w-3xl text-center">
        <h2 className="mb-8 text-3xl text-white">Customer Testimonials</h2>
        <div className="relative min-h-28 px-8">
          <QuoteIcon className="absolute left-0 top-0 h-7 w-7 text-brand" />
          <p className="text-base font-medium text-white">{t.quote}</p>
          <QuoteIcon className="absolute bottom-0 right-0 h-7 w-7 rotate-180 text-brand" />
        </div>
        <div className="mt-6 flex items-center justify-center gap-4">
          {t.logo && (
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white p-1">
              <Img src={t.logo} alt={t.author} className="max-h-full max-w-full object-contain" />
            </span>
          )}
          <b className="text-sm uppercase text-white">{t.author}</b>
        </div>
        <div className="mt-6 flex justify-center gap-1.5">
          {items.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Testimonial ${n + 1}`}
              aria-current={n === i}
              onClick={() => setI(n)}
              className={`h-2.5 w-2.5 rounded-full ${n === i ? "bg-white" : "bg-white/35"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

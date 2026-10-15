"use client";

import { useState } from "react";
import { useAutoplay } from "@/components/useAutoplay";
import Img from "@/ui/Img";
import { QuoteIcon } from "@/ui/Icons";

export type Testimonial = { quote: string; author: string; logo: string | null };

export default function Testimonials({ items, heading }: { items: Testimonial[]; heading: string }) {
  const [i, setI] = useState(0);
  const autoplay = useAutoplay(() => setI((v) => (v + 1) % items.length), 7000, items.length > 1);
  if (!items.length) return null;

  return (
    <section className="bg-[#1b1d1f] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02)_0_2px,transparent_2px_6px)] py-12">
      <div className="default-margin max-w-3xl text-center" {...autoplay}>
        <h2 className="mb-8 text-3xl text-white">{heading}</h2>
        {/* Every testimonial sits in the same grid cell, so the box is as tall as the longest one
            and the content below never jumps when the quote changes. */}
        <div className="grid">
          {items.map((t, n) => (
            <figure
              key={n}
              inert={n !== i}
              className={`[grid-area:1/1] transition-opacity duration-500 motion-reduce:transition-none ${n === i ? "opacity-100" : "opacity-0"}`}
            >
              <blockquote className="relative min-h-28 px-8">
                <QuoteIcon className="absolute left-0 top-0 h-7 w-7 text-brand" />
                <p className="text-base font-medium text-white">{t.quote}</p>
                <QuoteIcon className="absolute bottom-0 right-0 h-7 w-7 rotate-180 text-brand" />
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-center gap-4">
                {t.logo && (
                  <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                    <Img src={t.logo} alt={t.author} className="max-h-full max-w-full object-contain" />
                  </span>
                )}
                <b className="text-sm uppercase text-white">{t.author}</b>
              </figcaption>
            </figure>
          ))}
        </div>
        {items.length > 1 && (
          <div className="mt-4 flex justify-center">
            {items.map((_, n) => (
              // 24px hit area around the 10px dot
              <button
                key={n}
                type="button"
                aria-label={`Testimonial ${n + 1}`}
                aria-current={n === i}
                onClick={() => setI(n)}
                className="rounded-full p-[7px]"
              >
                <span className={`block h-2.5 w-2.5 rounded-full ${n === i ? "bg-white" : "bg-white/35"}`} />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

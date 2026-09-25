"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Img from "@/ui/Img";

export type Testimonial = { quote: string; author: string; logo: string | null };

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (d: number) => {
    setDir(d);
    setI((v) => (v + d + items.length) % items.length);
  };
  useEffect(() => {
    const t = setTimeout(() => go(1), 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);
  const t = items[i];
  if (!t) return null;
  return (
    <section className="py-16 sm:py-24">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-brand px-6 py-12 sm:px-14 sm:py-16">
          <p className="eyebrow mb-8 text-ink/60 before:bg-ink">What customers say</p>
          <div className="min-h-[220px] sm:min-h-[200px]">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.figure
                key={i}
                initial={{ opacity: 0, x: 24 * dir }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 * dir }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <blockquote className="max-w-4xl text-2xl font-medium leading-snug tracking-tight text-ink sm:text-4xl">“{t.quote}”</blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {t.logo && (
                    <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white p-1.5">
                      <Img src={t.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </span>
                  )}
                  <span className="text-sm font-semibold uppercase tracking-wide text-ink">{t.author}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
          <div className="mt-10 flex items-center gap-4">
            <button type="button" onClick={() => go(-1)} aria-label="Previous" className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next" className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-2">
              <ArrowRight className="h-4 w-4" />
            </button>
            <span className="ml-2 font-mono text-sm text-ink/70 tabular">
              {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

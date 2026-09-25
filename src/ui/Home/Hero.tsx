"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { openPalette } from "@/ui/CommandPalette";

export type HeroSlide = { image: string | null; eyebrow: string; title: string[]; href: string };

const DURATION = 6500;

export default function Hero({
  slides,
  quick,
  stats,
}: {
  slides: HeroSlide[];
  quick: { label: string; href: string }[];
  stats: { value: string; label: string }[];
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % slides.length), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, slides.length]);
  const s = slides[i];

  return (
    <section className="relative pt-24 sm:pt-28">
      <div className="container-x">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          {/* Copy */}
          <div className="flex min-w-0 flex-col justify-between rounded-[var(--radius-panel)] bg-white p-6 sm:p-10 lg:min-h-[600px]">
            <div>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="eyebrow mb-6">
                Access · Lifting · Safety — since 1974
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="display-xl"
              >
                Work at height,
                <br />
                <span className="relative isolate inline-block">
                  done right.
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-x-0 bottom-[0.08em] -z-10 h-[0.28em] origin-left rounded-sm bg-brand"
                  />
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="lead mt-6 max-w-lg"
              >
                Buy or rent aerial work platforms, scaffolding, material handling and fall-protection systems — backed by
                certified training and pan-India service.
              </motion.p>
            </div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.25 }} className="mt-10">
              <form action="/products" role="search" className="flex items-center gap-2 rounded-full border border-line bg-canvas p-1.5 pl-5 transition-shadow focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgb(247_228_51/0.35)]">
                <Search className="h-4 w-4 shrink-0 text-muted" />
                <input
                  name="q"
                  placeholder="Try “spider lift 22m” or “scaffold tower”"
                  aria-label="Search equipment"
                  className="h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-subtle"
                />
                <button type="submit" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-ink-2">
                  Search <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {quick.map((q) => (
                  <Link key={q.href} href={q.href} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-2 no-underline transition-colors hover:border-ink hover:text-ink">
                    {q.label}
                  </Link>
                ))}
                <button type="button" onClick={() => openPalette()} className="px-2 text-[13px] text-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
                  or press ⌘K
                </button>
              </div>
            </motion.div>
          </div>

          {/* Media */}
          <div
            className="relative min-h-[380px] overflow-hidden rounded-[var(--radius-panel)] bg-graphite sm:min-h-[480px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={i}
                className="absolute inset-0 bg-cover bg-[position:75%_center]"
                style={s?.image ? { backgroundImage: `url("${s.image}")` } : undefined}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.9 }, scale: { duration: 7, ease: "linear" } }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand">{s?.eyebrow}</p>
                  <Link href={s?.href ?? "/products"} className="group mt-2 flex items-end justify-between gap-4 no-underline">
                    <span className="text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">{s?.title.join(" ")}</span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-500 group-hover:-rotate-45">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </motion.div>
              </AnimatePresence>
              <div className="mt-6 flex gap-1.5">
                {slides.map((_, n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Slide ${n + 1}`}
                    aria-current={n === i}
                    onClick={() => setI(n)}
                    className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    {n === i && (
                      <motion.span
                        key={`${i}-${paused}`}
                        className="absolute inset-y-0 left-0 bg-brand"
                        initial={{ width: "0%" }}
                        animate={{ width: paused ? "0%" : "100%" }}
                        transition={{ duration: paused ? 0 : DURATION / 1000, ease: "linear" }}
                      />
                    )}
                    {n < i && <span className="absolute inset-0 bg-white/70" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:grid-cols-4">
          {stats.map((st, n) => (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + n * 0.06, duration: 0.6 }}
              className="bg-white px-5 py-5 sm:px-7 sm:py-6"
            >
              <p className="font-mono text-2xl font-medium tracking-tight tabular sm:text-3xl">{st.value}</p>
              <p className="mt-1 text-[13px] text-muted">{st.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

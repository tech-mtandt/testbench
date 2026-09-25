"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDownToLine, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Chip from "@/ui/kit/Chip";
import Sheet from "@/ui/kit/Sheet";
import FallbackImg from "./FallbackImg";
import DownloadGate, { DownloadReady, isUnlocked } from "./DownloadGate";

export type CatalogueItem = {
  id: number | string;
  title: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  posterUrl: string | null;
  /** Local legacy copy, used if the Payload media URL fails to load. */
  fallbackPosterUrl?: string | null;
  documentUrl: string | null;
};

export const COMPANY = "Company & services";
const catOf = (c: CatalogueItem) => c.category || COMPANY;
const norm = (s: string) => s.toLowerCase().normalize("NFKD");

type Filters = { category: string | null; brand: string | null; q: string };

/** Catalogue library: category + brand chips and search (mirrored to the URL), portrait cover grid, gated download sheet. */
export default function CatalogueGrid({ catalogues, categories, initial }: { catalogues: CatalogueItem[]; categories: string[]; initial: Filters }) {
  const [f, setF] = useState<Filters>(initial);
  const [active, setActive] = useState<CatalogueItem | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams();
    if (f.category) p.set("category", f.category);
    if (f.brand) p.set("brand", f.brand);
    if (f.q) p.set("q", f.q);
    const qs = p.toString();
    try {
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
    } catch {}
  }, [f]);

  const cats = useMemo(() => {
    const present = new Set(catalogues.map(catOf));
    return [...categories.filter((c) => present.has(c)), ...[...present].filter((c) => !categories.includes(c))].map((c) => ({
      name: c,
      count: catalogues.filter((x) => catOf(x) === c).length,
    }));
  }, [catalogues, categories]);

  const inCat = useMemo(() => catalogues.filter((c) => !f.category || catOf(c) === f.category), [catalogues, f.category]);
  const brands = useMemo(() => {
    const m = new Map<string, number>();
    inCat.forEach((c) => c.brand && m.set(c.brand, (m.get(c.brand) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [inCat]);
  const list = useMemo(() => {
    const q = norm(f.q.trim());
    return inCat.filter(
      (c) => (!f.brand || c.brand === f.brand) && (!q || norm([c.title, c.brand, c.category, c.subcategory].filter(Boolean).join(" ")).includes(q)),
    );
  }, [inCat, f.brand, f.q]);

  const set = (p: Partial<Filters>) => setF((o) => ({ ...o, ...p }));
  const any = f.category || f.brand || f.q;

  const open = (c: CatalogueItem) => {
    setUnlocked(isUnlocked());
    setActive(c);
  };

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-[76px] z-20 -mx-4 mb-8 bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:top-[84px] sm:mx-0 sm:rounded-[var(--radius-card)] sm:px-0">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-full border border-line bg-white px-4 transition-shadow focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgb(247_228_51/0.35)] lg:w-72 lg:shrink-0">
            <Search className="h-4 w-4 shrink-0 text-muted" />
            <input
              value={f.q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Search catalogues or brands"
              aria-label="Search catalogues"
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
            />
            {f.q && (
              <button type="button" onClick={() => set({ q: "" })} aria-label="Clear search" className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div className="no-scrollbar -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" data-lenis-prevent>
            <Chip active={!f.category} onClick={() => set({ category: null, brand: null })} count={catalogues.length}>
              All
            </Chip>
            {cats.map((c) => (
              <Chip key={c.name} active={f.category === c.name} onClick={() => set({ category: f.category === c.name ? null : c.name, brand: null })} count={c.count}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
        {brands.length > 1 && (
          <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" data-lenis-prevent>
            <span className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-subtle uppercase">Brand</span>
            {brands.map(([b, n]) => (
              <button
                key={b}
                type="button"
                aria-pressed={f.brand === b}
                onClick={() => set({ brand: f.brand === b ? null : b })}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12.5px] transition-colors ${
                  f.brand === b ? "bg-brand text-ink" : "bg-ink/5 text-ink-2 hover:bg-ink/10"
                }`}
              >
                {b} <span className="font-mono text-[10px] opacity-60">{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between text-sm">
        <p className="text-muted" aria-live="polite">
          <span className="font-mono text-ink tabular">{list.length}</span> {list.length === 1 ? "catalogue" : "catalogues"}
          {f.category && <> in {f.category}</>}
          {f.brand && <> · {f.brand}</>}
        </p>
        {any && (
          <button type="button" onClick={() => setF({ category: null, brand: null, q: "" })} className="text-[13px] text-muted underline underline-offset-4 hover:text-ink">
            Reset filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <p className="text-lg font-semibold">No catalogues match</p>
          <p className="mt-1 text-sm text-muted">Try another brand or clear the search.</p>
          <button type="button" onClick={() => setF({ category: null, brand: null, q: "" })} className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white">
            Show all catalogues
          </button>
        </div>
      ) : (
        <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <button type="button" onClick={() => open(item)} className="group block w-full text-left">
                  <span className="relative block aspect-[1/1.414] overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-line transition-shadow duration-500 group-hover:shadow-[var(--shadow-lift)]">
                    <FallbackImg
                      src={item.posterUrl}
                      fallback={item.fallbackPosterUrl}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-center bg-gradient-to-t from-ink/70 to-transparent p-4 pt-12 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                      <span className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-[13px] font-medium text-ink">
                        <ArrowDownToLine className="h-4 w-4" /> Download
                      </span>
                    </span>
                  </span>
                  <span className="mt-3 block text-[14.5px] leading-snug font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-[12.5px] text-muted">
                    <span className="min-w-0 truncate">{[item.brand, catOf(item)].filter(Boolean).join(" · ")}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-subtle">PDF</span>
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Sheet
        open={Boolean(active)}
        onClose={() => setActive(null)}
        title={unlocked ? "Download catalogue" : "Get the catalogue"}
        description={active ? <span className="font-medium text-ink">{active.title}</span> : null}
        width="max-w-lg"
      >
        {active && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-[var(--radius-card)] bg-white p-3 ring-1 ring-line">
              <span className="relative block aspect-[1/1.414] w-16 shrink-0 overflow-hidden rounded-lg bg-canvas">
                <FallbackImg src={active.posterUrl} fallback={active.fallbackPosterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </span>
              <span className="min-w-0 text-sm">
                <span className="block font-medium text-ink">{active.title}</span>
                <span className="block text-muted">{[active.brand, catOf(active)].filter(Boolean).join(" · ")}</span>
                {!unlocked && <span className="mt-1 block text-[12px] text-subtle">Tell us who you are and the PDF opens right away.</span>}
              </span>
            </div>
            {unlocked ? <DownloadReady title={active.title} href={active.documentUrl} again /> : <DownloadGate key={active.id} title={active.title} href={active.documentUrl} />}
          </div>
        )}
      </Sheet>
    </>
  );
}

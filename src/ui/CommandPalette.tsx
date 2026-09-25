"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/lib/search-index";
import Img from "@/ui/Img";

const OPEN_EVENT = "mt:open-palette";
/** Open the palette from anywhere (e.g. a header button). */
export const openPalette = (q = "") => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: q }));

const GROUP_ORDER: SearchEntry["g"][] = ["Categories", "Equipment", "Services", "Industries", "Articles", "Events", "Press", "Pages"];

function rank(entries: SearchEntry[], q: string) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored: [number, SearchEntry][] = [];
  for (const e of entries) {
    const t = e.t.toLowerCase();
    const hay = `${t} ${e.s ?? ""} ${e.k ?? ""}`.toLowerCase();
    if (!terms.every((w) => hay.includes(w))) continue;
    let score = 0;
    if (t.startsWith(terms[0])) score += 6;
    for (const w of terms) if (t.includes(w)) score += 3;
    if (e.g === "Categories") score += 4;
    if (e.g === "Equipment") score += 1;
    scored.push([score - t.length / 200, e]);
  }
  return scored.sort((a, b) => b[0] - a[0]).map(([, e]) => e).slice(0, 40);
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const show = useCallback((initial = "") => {
    setQ(initial);
    setActive(0);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        show();
      }
    };
    const onOpen = (e: Event) => show((e as CustomEvent<string>).detail ?? "");
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    if (!index)
      fetch("/search.json")
        .then((r) => r.json())
        .then(setIndex)
        .catch(() => setIndex([]));
    const t = setTimeout(() => input.current?.focus(), 30);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.documentElement.style.overflow = prev;
    };
  }, [open, index]);

  const results = useMemo(() => {
    if (!index) return [];
    if (!q.trim()) return index.filter((e) => e.g === "Categories" || e.g === "Pages").slice(0, 16);
    return rank(index, q);
  }, [index, q]);

  const grouped = useMemo(() => {
    const m = new Map<string, SearchEntry[]>();
    for (const r of results) m.set(r.g, [...(m.get(r.g) ?? []), r]);
    return GROUP_ORDER.filter((g) => m.has(g)).map((g) => [g, m.get(g)!] as const);
  }, [results]);
  const flat = grouped.flatMap(([, items]) => items);

  const go = (e: SearchEntry | undefined) => {
    if (!e) {
      if (q.trim()) router.push(`/products?q=${encodeURIComponent(q.trim())}`);
      setOpen(false);
      return;
    }
    setOpen(false);
    router.push(e.h);
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    if (ev.key === "Escape") setOpen(false);
    else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      go(flat[active]);
    }
  };

  useEffect(() => {
    list.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let n = -1;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center px-3 pt-[10vh]" data-lenis-prevent>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl overflow-hidden rounded-[var(--radius-panel)] border border-white/40 bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-5">
              <Search className="h-5 w-5 shrink-0 text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search equipment, services, articles…"
                className="h-16 w-full bg-transparent text-base outline-none placeholder:text-subtle"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={flat[active] ? `pal-${active}` : undefined}
              />
              <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 font-mono text-[11px] text-muted sm:block">Esc</kbd>
            </div>
            <div ref={list} id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
              {!index && <p className="px-4 py-10 text-center text-sm text-muted">Loading…</p>}
              {index && !flat.length && q && (
                <button type="button" onClick={() => go(undefined)} className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm hover:bg-canvas">
                  <span>
                    Search the catalog for <span className="font-medium">“{q}”</span>
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {grouped.map(([g, items]) => (
                <div key={g} className="mb-1">
                  <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">{g}</p>
                  {items.map((e) => {
                    n++;
                    const i = n;
                    const on = i === active;
                    return (
                      <button
                        key={e.h}
                        id={`pal-${i}`}
                        data-idx={i}
                        role="option"
                        aria-selected={on}
                        type="button"
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(e)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${on ? "bg-canvas" : ""}`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
                          {e.i ? <Img src={e.i} alt="" className="h-full w-full object-contain p-1" /> : <span className="h-2 w-2 rounded-full bg-brand" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-ink">{e.t}</span>
                          {e.s && <span className="block truncate text-xs text-muted">{e.s}</span>}
                        </span>
                        {on && <CornerDownLeft className="h-4 w-4 shrink-0 text-muted" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 border-t border-line bg-canvas/60 px-5 py-2.5 font-mono text-[11px] text-muted">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span className="ml-auto hidden sm:block">⌘K anywhere</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

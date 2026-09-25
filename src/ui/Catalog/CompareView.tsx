"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { GitCompareArrows, Plus, X } from "lucide-react";
import Img from "@/ui/Img";
import { useEnquiry } from "@/ui/Enquiry";
import { buttonClass } from "@/ui/kit/Button";
import { COMPARE_MAX, compareHref, readCompare, writeCompare } from "./compare-store";

export type CompareColumn = {
  slug: string;
  href: string;
  title: string;
  model: string;
  image: string | null;
  photo: boolean;
  categoryName: string;
};
export type CompareRow = { label: string; values: string[] };

const norm = (v: string) => v.toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Side-by-side spec table. The URL (?items=) is the source of truth for what the server
 * rendered; the browser's compare selection is kept in sync with it both ways.
 */
export default function CompareView({ columns, rows, addHref }: { columns: CompareColumn[]; rows: CompareRow[]; addHref: string }) {
  const router = useRouter();
  const { open } = useEnquiry();
  const [diff, setDiff] = useState(false);
  const [pending, start] = useTransition();
  const synced = useRef(false);

  // First visit without ?items: load the stored selection. With ?items: adopt it as the selection.
  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    const stored = readCompare();
    if (!columns.length && stored.length) start(() => router.replace(compareHref(stored), { scroll: false }));
    else if (columns.length) writeCompare(columns.map((c) => ({ slug: c.slug, title: c.title, image: c.image })));
  }, [columns, router]);

  const remove = (slug: string) => {
    const next = columns.filter((c) => c.slug !== slug);
    writeCompare(next.map((c) => ({ slug: c.slug, title: c.title, image: c.image })));
    start(() => router.replace(compareHref(next), { scroll: false }));
  };

  if (!columns.length)
    return (
      <div className="flex flex-col items-center rounded-[var(--radius-panel)] border border-dashed border-line-strong bg-white/50 px-6 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
          <GitCompareArrows className="h-6 w-6 text-muted" />
        </span>
        <h2 className="mt-5 text-xl">{pending ? "Loading your selection…" : "Nothing to compare yet"}</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Tap <span className="font-medium text-ink">Compare</span> on up to {COMPARE_MAX} machines in the catalog — they&apos;ll line up here spec by spec.
        </p>
        <Link href="/products" className={buttonClass("dark", "md", "mt-6")}>
          Browse equipment
        </Link>
      </div>
    );

  const differs = rows.map((r) => new Set(r.values.map(norm).filter(Boolean)).size > 1 || (r.values.some((v) => !v) && r.values.some(Boolean)));
  const nDiff = differs.filter(Boolean).length;
  const cols = columns.length < COMPARE_MAX ? columns.length + 1 : columns.length;
  const grid = { gridTemplateColumns: `minmax(120px, 0.8fr) repeat(${cols}, minmax(170px, 1fr))` };

  return (
    <div className={`transition-opacity ${pending ? "opacity-60" : ""}`}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-mono font-medium text-ink tabular">{columns.length}</span> of {COMPARE_MAX} selected ·{" "}
          <span className="font-mono tabular">{nDiff}</span> of {rows.length} specs differ
        </p>
        <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-ink">
          <span>Highlight differences</span>
          <button
            type="button"
            role="switch"
            aria-checked={diff}
            onClick={() => setDiff((d) => !d)}
            className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${diff ? "bg-ink" : "bg-ink/15"}`}
          >
            <span className={`absolute top-1 left-1 h-5 w-5 rounded-full shadow-sm transition-transform duration-300 ease-[var(--ease-out-expo)] ${diff ? "translate-x-5 bg-brand" : "bg-white"}`} />
          </button>
        </label>
      </div>

      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" data-lenis-prevent>
        <div className="min-w-fit overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white">
          {/* header row: products */}
          <div className="grid border-b border-line" style={grid}>
            <div className="sticky left-0 z-10 flex items-end bg-white p-4 sm:p-5">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Model</p>
            </div>
            {columns.map((c) => (
              <div key={c.slug} className="relative min-w-0 border-l border-line p-4 sm:p-5">
                <button
                  type="button"
                  onClick={() => remove(c.slug)}
                  aria-label={`Remove ${c.title}`}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink/5 text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <Link href={c.href} className="group block no-underline">
                  <span className={`relative block aspect-[4/3] overflow-hidden rounded-2xl ${c.photo ? "bg-line" : "bg-canvas"}`}>
                    <Img src={c.image ?? undefined} alt="" className={`absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-105 ${c.photo ? "object-cover" : "object-contain p-3 mix-blend-multiply"}`} />
                  </span>
                  <span className="mt-3 block truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">{c.categoryName}</span>
                  <span className="mt-1 line-clamp-2 block text-[15px] font-medium leading-snug text-ink">{c.title}</span>
                  {c.model && <span className="mt-0.5 block truncate font-mono text-xs text-muted">{c.model}</span>}
                </Link>
                <button type="button" onClick={() => open({ subject: `${c.title}${c.model ? ` (${c.model})` : ""}`, source: `compare:${c.slug}` })} className={buttonClass("primary", "sm", "mt-4 w-full")}>
                  Get a quote
                </button>
              </div>
            ))}
            {columns.length < COMPARE_MAX && (
              <div className="border-l border-line p-4 sm:p-5">
                <Link
                  href={addHref}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm text-muted no-underline transition-colors hover:border-ink hover:text-ink"
                >
                  <Plus className="h-5 w-5" />
                  Add a machine
                </Link>
              </div>
            )}
          </div>
          {/* spec rows */}
          {rows.map((r, i) => {
            const d = differs[i];
            const dim = diff && !d;
            return (
              <div key={r.label} className={`grid border-b border-line last:border-b-0 transition-colors ${diff && d ? "bg-brand/15" : ""}`} style={grid}>
                <div className={`sticky left-0 z-10 flex items-center gap-2 p-4 text-sm sm:px-5 ${diff && d ? "bg-[#fcf8d6]" : "bg-white"} ${dim ? "text-subtle" : "text-muted"}`}>
                  {diff && d && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-label="differs" />}
                  {r.label}
                </div>
                {columns.map((c, k) => (
                  <div key={c.slug} className={`min-w-0 border-l border-line p-4 font-mono text-sm break-words tabular sm:px-5 ${dim ? "text-subtle" : "text-ink"}`}>
                    {r.values[k] || <span className="text-subtle">—</span>}
                  </div>
                ))}
                {columns.length < COMPARE_MAX && <div className="border-l border-line" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

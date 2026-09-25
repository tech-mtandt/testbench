"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Segmented from "@/ui/kit/Segmented";
import Sheet from "@/ui/kit/Sheet";
import FilterRail, { type RailGroup } from "./FilterRail";
import { useFilters } from "./FilterState";

type Opt = { value: string; label: string; count: number };

export function SearchBox({ placeholder = "Search by name, model or spec — e.g. “spider lift 22m”" }: { placeholder?: string }) {
  const { get, set } = useFilters();
  const urlQ = get("q") ?? "";
  const [value, setValue] = useState(urlQ);
  const focused = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // follow external changes (pill removed, back/forward) unless the user is typing
  useEffect(() => {
    if (!focused.current) setValue(urlQ);
  }, [urlQ]);

  const push = (v: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (v.trim() !== urlQ) set({ q: v.trim() || null, sort: null });
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        push(value);
      }}
      className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-white pr-1.5 pl-4 transition-shadow focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgb(247_228_51/0.35)]"
    >
      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <input
        type="search"
        name="q"
        value={value}
        placeholder={placeholder}
        aria-label="Search equipment"
        autoComplete="off"
        onFocus={() => (focused.current = true)}
        onBlur={() => {
          focused.current = false;
          push(value);
        }}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => push(v), 350);
        }}
        className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-subtle focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            push("");
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export function ModeSwitch({ counts }: { counts: { all: number; buy: number; rent: number } }) {
  const { get, set } = useFilters();
  const mode = (get("mode") as "buy" | "rent" | null) ?? "all";
  const lbl = (t: string, n: number) => (
    <span className="flex items-center gap-1.5">
      {t}
      <span className="font-mono text-[11px] text-subtle tabular">{n}</span>
    </span>
  );
  return (
    <Segmented
      ariaLabel="Buy or rent"
      value={mode}
      onChange={(v) => set({ mode: v === "all" ? null : v })}
      options={[
        { value: "all", label: lbl("All", counts.all) },
        { value: "buy", label: lbl("Buy", counts.buy) },
        { value: "rent", label: lbl("Rent", counts.rent) },
      ]}
      className="shrink-0"
    />
  );
}

export function SortSelect({ options, hasQuery }: { options: { value: string; label: string }[]; hasQuery: boolean }) {
  const { get, set } = useFilters();
  const value = get("sort") ?? "relevance";
  return (
    <label className="relative inline-flex h-10 shrink-0 items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={(e) => set({ sort: e.target.value === "relevance" ? null : e.target.value })}
        className="h-10 appearance-none rounded-full border border-line bg-white pr-9 pl-4 text-[13px] font-medium text-ink transition-colors hover:border-ink/40 focus:border-ink focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === "relevance" && !hasQuery ? "Featured" : o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted" />
    </label>
  );
}

/** Mobile: a "Filters" button that opens the rail in a sheet. */
export function MobileFilters({ groups, activeCount, total }: { groups: RailGroup[]; activeCount: number; total: number }) {
  const [open, setOpen] = useState(false);
  const { clearAll, pending } = useFilters();
  if (!groups.length) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium text-ink lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 font-mono text-[11px] text-ink">{activeCount}</span>}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Filters" description={`${total} matching ${total === 1 ? "item" : "items"}`} width="max-w-md">
        <FilterRail groups={groups} />
        <div className="sticky -bottom-6 -mx-6 mt-6 flex gap-3 border-t border-line bg-canvas px-6 py-4">
          <button type="button" onClick={() => clearAll(["mode", "q", "category"])} className="h-12 flex-1 rounded-full border border-line-strong bg-white text-sm font-medium">
            Reset
          </button>
          <button type="button" onClick={() => setOpen(false)} className="h-12 flex-[2] rounded-full bg-ink text-sm font-medium text-white">
            {pending ? "Updating…" : `Show ${total} results`}
          </button>
        </div>
      </Sheet>
    </>
  );
}

/** Horizontal, scrollable single-select chips (categories on /products, product lines on a category page). */
export function ChipRow({ param, options, allLabel, allCount }: { param: string; options: Opt[]; allLabel: string; allCount: number }) {
  const { get, set } = useFilters();
  const cur = get(param);
  const chip = (active: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-medium transition-colors duration-300 ${
      active ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-ink/40"
    }`;
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <button type="button" aria-pressed={!cur} onClick={() => set(param === "category" ? { category: null, sub: null } : { [param]: null })} className={chip(!cur)}>
        {allLabel}
        <span className={`font-mono text-[11px] tabular ${!cur ? "text-white/60" : "text-subtle"}`}>{allCount}</span>
      </button>
      {options.map((o) => {
        const on = cur === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            disabled={o.count === 0 && !on}
            onClick={() => set(param === "category" ? { category: on ? null : o.value, sub: null } : { [param]: on ? null : o.value })}
            className={`${chip(on)} disabled:opacity-40`}
          >
            {o.label}
            <span className={`font-mono text-[11px] tabular ${on ? "text-white/60" : "text-subtle"}`}>{o.count}</span>
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useOptimistic, useTransition, type ReactNode } from "react";
import { ArrowDown, X } from "lucide-react";

type Patch = Record<string, string | null>;
type Ctx = {
  params: URLSearchParams;
  pending: boolean;
  get: (k: string) => string | null;
  list: (k: string) => string[];
  set: (patch: Patch) => void;
  toggle: (k: string, v: string) => void;
  clearAll: (keep?: string[]) => void;
};

const FilterCtx = createContext<Ctx | null>(null);

/**
 * URL-backed filter state. Updates are optimistic (controls respond instantly) and run in
 * a transition: the server re-renders the results for the new searchParams.
 */
export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [qs, setQs] = useOptimistic(sp.toString());
  const params = useMemo(() => new URLSearchParams(qs), [qs]);

  const commit = useCallback(
    (next: URLSearchParams) => {
      next.sort();
      const s = next.toString();
      start(() => {
        setQs(s);
        router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
      });
    },
    [pathname, router, setQs],
  );

  const set = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(qs);
      for (const [k, v] of Object.entries(patch)) (v === null || v === "" ? next.delete(k) : next.set(k, v));
      if (!("show" in patch)) next.delete("show");
      commit(next);
    },
    [qs, commit],
  );

  const value = useMemo<Ctx>(() => {
    const list = (k: string) => (params.get(k) ?? "").split(",").filter(Boolean);
    return {
      params,
      pending,
      get: (k) => params.get(k),
      list,
      set,
      toggle: (k, v) => {
        const cur = list(k);
        const nextList = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
        set({ [k]: nextList.join(",") || null });
      },
      clearAll: (keep = []) => {
        const next = new URLSearchParams();
        for (const k of keep) {
          const v = params.get(k);
          if (v) next.set(k, v);
        }
        commit(next);
      },
    };
  }, [params, pending, set, commit]);

  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

export function useFilters() {
  const c = useContext(FilterCtx);
  if (!c) throw new Error("useFilters must be used inside <FilterProvider>");
  return c;
}

/** Dims server-rendered results while a filter transition is in flight. */
export function ResultsPane({ children }: { children: ReactNode }) {
  const { pending } = useFilters();
  return (
    <div aria-busy={pending} className={`transition-opacity duration-300 ${pending ? "pointer-events-none opacity-50" : "opacity-100"}`}>
      {children}
    </div>
  );
}

export function ShowMore({ shown, total }: { shown: number; total: number }) {
  const { set, pending } = useFilters();
  if (shown >= total) return null;
  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      <p className="font-mono text-xs text-subtle tabular">
        {shown} of {total}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => set({ show: String(shown + 36) })}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-white px-5 text-sm font-medium text-ink transition-colors hover:border-ink"
      >
        Show more <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

export type ActiveFilter = { param: string; value: string | null; label: string };

/** Removable pills for the filters currently applied. */
export function ActivePills({ items, keep = [] }: { items: ActiveFilter[]; keep?: string[] }) {
  const { set, toggle, clearAll } = useFilters();
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((a) => (
        <button
          key={`${a.param}:${a.value}`}
          type="button"
          onClick={() => (a.value ? toggle(a.param, a.value) : set({ [a.param]: null }))}
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/5 pr-2 pl-3 text-[13px] text-ink transition-colors hover:bg-ink hover:text-white"
          aria-label={`Remove filter ${a.label}`}
        >
          {a.label}
          <X className="h-3.5 w-3.5 opacity-60" />
        </button>
      ))}
      {items.length > 1 && (
        <button type="button" onClick={() => clearAll(keep)} className="h-8 px-2 text-[13px] text-muted underline-offset-4 hover:text-ink hover:underline">
          Clear all
        </button>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FacetKey, Mode, ProductSummary, SortOption } from "@/content/products";
import ProductRow from "./ProductRow";
import CompareBar from "./CompareBar";
import HeightFilter, { inHeight, useHeightRange } from "./HeightFilter";

export type NavOption = { label: string; href: string; active: boolean; disabled?: boolean };
export type FacetGroup = { key: FacetKey; title: string; options: { id: string; label: string }[]; showAll?: boolean };

const PER_PAGE = 8;

/** Working height, or lifting height for material handling (as the listing order uses). */
const heightOf = (p: ProductSummary) => p.num.working_height ?? p.num.mhe_maxliftingheight ?? null;

type Props = {
  mode: Mode;
  title: string;
  description: string;
  products: ProductSummary[];
  groups: FacetGroup[];
  categoryNav: NavOption[];
  subcategoryNav: NavOption[];
  sorts: SortOption[];
};

export default function ListingView({ mode, title, description, products, groups, categoryNav, subcategoryNav, sorts }: Props) {
  const [sel, setSel] = useState<Partial<Record<FacetKey, string[]>>>({});
  const [height, setHeight] = useHeightRange();
  const [sort, setSort] = useState(0);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (key: FacetKey, id: string) => {
    setPage(0);
    setSel((s) => {
      const cur = s[key] ?? [];
      return { ...s, [key]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
    });
  };

  // The other filters, for the height histogram (which then shows what the height would add).
  const matching = useMemo(
    () =>
      products.filter((p) =>
        (Object.entries(sel) as [FacetKey, string[]][]).every(([key, ids]) => !ids.length || ids.some((id) => p.facets[key]?.includes(id))),
      ),
    [products, sel],
  );
  const heightLabel = products.some((p) => p.num.working_height != null) ? "Working height" : "Lifting height";
  const known = (list: ProductSummary[]) => list.map(heightOf).filter((h): h is number => h != null);

  const filtered = useMemo(() => {
    const out = matching.filter((p) => inHeight(heightOf(p), height));
    const s = sorts[sort];
    if (s) {
      const dir = s.dir === "asc" ? 1 : -1;
      out.sort((a, b) => {
        const x = a.num[s.field];
        const y = b.num[s.field];
        if (x == null) return y == null ? 0 : 1;
        if (y == null) return -1;
        return (x - y) * dir;
      });
    }
    return out;
  }, [matching, height, sort, sorts]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);
  const count = (key: FacetKey, id: string) => products.filter((p) => p.facets[key]?.includes(id)).length;
  const reset = () => {
    setSel({});
    setHeight(null);
    setPage(0);
  };
  const go = (n: number) => {
    setPage(n);
    document.getElementById("listing-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const renderGroup = (g: FacetGroup) => {
    const opts = g.options.map((o) => ({ ...o, n: count(g.key, o.id) })).filter((o) => g.showAll || o.n > 0);
    if (!opts.length) return null;
    return (
      <FilterBox key={g.key} title={g.title}>
        {opts.map((o) => (
          <Check
            key={o.id}
            label={o.label}
            disabled={o.n === 0}
            checked={sel[g.key]?.includes(o.id) ?? false}
            onChange={() => toggle(g.key, o.id)}
          />
        ))}
      </FilterBox>
    );
  };

  return (
    <div className="grid scroll-mt-28 gap-8 lg:grid-cols-[265px_minmax(0,1fr)]" id="listing-top">
      <aside className="min-w-0">
        <div className="flex items-center justify-between lg:justify-end">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="btn-yellow text-xs lg:hidden"
            aria-expanded={showFilters}
          >
            Filter
          </button>
          <button type="button" onClick={reset} className="text-sm text-ink underline hover:text-ink-soft">
            Reset All
          </button>
        </div>
        <div className={`${showFilters ? "block" : "hidden"} mt-4 space-y-5 lg:block`}>
          {groups.filter((g) => g.key === "condition" || g.key === "country").map(renderGroup)}
          <NavGroup title="Category" options={categoryNav} />
          <NavGroup title="Subcategory" options={subcategoryNav} />
          {groups.filter((g) => g.key === "primaryType" || g.key === "powerType").map(renderGroup)}
          {known(products).length > 1 && (
            <FilterBox title={`${heightLabel} (m)`}>
              <HeightFilter
                all={known(products)}
                heights={known(matching)}
                value={height}
                label={heightLabel}
                showLabel={false}
                onChange={(r) => {
                  setPage(0);
                  setHeight(r);
                }}
              />
              {height && matching.some((p) => heightOf(p) == null) && (
                <p className="pt-2 text-xs text-ink-soft">Machines without a listed height are not shown.</p>
              )}
            </FilterBox>
          )}
          {groups.filter((g) => ["application", "industry", "brand"].includes(g.key)).map(renderGroup)}
        </div>
      </aside>

      <section className="min-w-0 lg:pt-4">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
            {description && <p className="mt-3 text-[13px] leading-snug text-ink">{description}</p>}
          </div>
          <div className="shrink-0 space-y-3 md:w-52">
            <p className="text-sm text-ink">
              Showing{" "}
              <strong>
                {visible.length} of {filtered.length}
              </strong>{" "}
              Products
            </p>
            {sorts.length > 0 && (
              <select
                aria-label="Sort by"
                value={sort}
                onChange={(e) => setSort(Number(e.target.value))}
                className="field py-2 text-xs"
              >
                {sorts.map((s, i) => (
                  <option key={i} value={i}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {visible.length ? (
          <div className="space-y-5">
            {visible.map((p) => (
              <ProductRow key={p.slug} p={p} rent={mode === "rental"} />
            ))}
          </div>
        ) : (
          <p className="rounded-md bg-surface p-8 text-center text-sm text-ink-soft">No products found.</p>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-end gap-3 text-sm">
            <button type="button" disabled={current === 0} onClick={() => go(current - 1)} className="px-2 disabled:opacity-40">
              Prev
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-current={i === current ? "page" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${i === current ? "bg-brand" : "hover:bg-brand-cream"}`}
              >
                {i + 1}
              </button>
            ))}
            <span className="text-ink-soft">of {pages}</span>
            <button
              type="button"
              disabled={current >= pages - 1}
              onClick={() => go(current + 1)}
              className="px-2 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        )}
      </section>
      <CompareBar />
    </div>
  );
}

function FilterBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink">{title}</h2>
      <div className="space-y-2 rounded-md bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.12)]">{children}</div>
    </div>
  );
}

function Check({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? "cursor-not-allowed text-ink-soft/70" : "cursor-pointer text-ink"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      {label}
    </label>
  );
}

function NavGroup({ title, options }: { title: string; options: NavOption[] }) {
  if (!options.length) return null;
  return (
    <FilterBox title={title}>
      {options.map((o) =>
        o.disabled ? (
          <Check key={o.href} label={o.label} checked={false} disabled onChange={() => {}} />
        ) : (
          <Link
            key={o.href}
            href={o.href}
            className="flex items-center gap-2 text-sm text-ink no-underline hover:underline"
            aria-current={o.active ? "page" : undefined}
          >
            <input type="checkbox" checked={o.active} readOnly tabIndex={-1} className="pointer-events-none" />
            {o.label}
          </Link>
        ),
      )}
    </FilterBox>
  );
}

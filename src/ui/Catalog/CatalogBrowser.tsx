import Link from "next/link";
import { SearchX } from "lucide-react";
import { SORTS, SUGGESTIONS, type CatalogView } from "@/content/catalog-view";
import FilterRail, { type RailGroup } from "./FilterRail";
import { ActivePills, FilterProvider, ResultsPane, ShowMore } from "./FilterState";
import ProductCard from "./ProductCard";
import { ChipRow, MobileFilters, ModeSwitch, SearchBox, SortSelect } from "./Toolbar";

const sum = (o: { count: number }[]) => o.reduce((n, x) => n + x.count, 0);

/**
 * Filterable product grid. Results are rendered on the server from searchParams; the
 * controls are client islands that rewrite the URL (router.replace, scroll: false).
 */
export default function CatalogBrowser({
  view,
  scope,
  resetHref,
}: {
  view: CatalogView;
  /** "all" = /products (category chips); otherwise the category slug (product-line chips) */
  scope: "all" | string;
  resetHref: string;
}) {
  const f = view.filters;
  const all = scope === "all";
  const groups: RailGroup[] = [
    ...(all && view.subs.length > 1 ? [{ param: "sub", label: "Product line", options: view.subs, single: true }] : []),
    ...(view.heights.length > 1 || f.h ? [{ param: "h", label: "Working height", options: view.heights, single: true }] : []),
    ...view.facets.map((g) => ({ param: g.param, label: g.label, options: g.options })),
  ];
  const activeCount = view.active.filter((a) => a.param !== "q" && a.param !== "category").length;
  const pills = view.active.filter((a) => all || a.param !== "sub");

  return (
    <FilterProvider>
      <div className="container-x" id="results">
        {all ? (
          <ChipRow param="category" options={view.categories} allLabel="All equipment" allCount={sum(view.categories)} />
        ) : (
          view.subs.length > 1 && <ChipRow param="sub" options={view.subs} allLabel="All product lines" allCount={sum(view.subs)} />
        )}

        <div className={`mt-8 grid grid-cols-1 gap-8 ${groups.length ? "lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12" : ""}`}>
          {groups.length > 0 && (
            <aside className="hidden lg:block" aria-label="Filters">
              <div className="no-scrollbar sticky top-28 max-h-[calc(100dvh-8rem)] overflow-y-auto pb-8" data-lenis-prevent>
                <FilterRail groups={groups} />
              </div>
            </aside>
          )}

          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchBox />
              <ModeSwitch counts={view.modeCounts} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted" aria-live="polite">
                <span className="font-mono font-medium text-ink tabular">{view.total}</span> {view.total === 1 ? "result" : "results"}
                {view.loose && <span> — no exact match for “{f.q}”, showing closest</span>}
              </p>
              <div className="flex items-center gap-2">
                <MobileFilters groups={groups} activeCount={activeCount} total={view.total} />
                <SortSelect options={SORTS} hasQuery={!!f.q} />
              </div>
            </div>
            {pills.length > 0 && (
              <div className="mt-4">
                <ActivePills items={pills} keep={["mode"]} />
              </div>
            )}

            <ResultsPane>
              {view.results.length > 0 ? (
                <ul className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
                  {view.results.map((it, i) => (
                    <li key={it.slug} className="min-w-0">
                      <ProductCard item={it} priority={i < 3} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-6 flex flex-col items-center rounded-[var(--radius-panel)] border border-dashed border-line-strong bg-white/50 px-6 py-16 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/5">
                    <SearchX className="h-6 w-6 text-muted" />
                  </span>
                  <h2 className="mt-5 text-xl">Nothing matches those filters</h2>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    Try removing a filter or searching by model number. Can&apos;t find it? Our team can source it — ask for a quote.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link href={resetHref} scroll={false} className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-white no-underline">
                      Reset filters
                    </Link>
                    {SUGGESTIONS.map((s) => (
                      <Link key={s.href} href={s.href} className="inline-flex h-10 items-center rounded-full border border-line bg-white px-4 text-[13px] text-ink-2 no-underline hover:border-ink/40">
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <ShowMore shown={view.results.length} total={view.total} />
            </ResultsPane>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}

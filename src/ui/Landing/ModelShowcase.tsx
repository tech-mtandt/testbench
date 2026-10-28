"use client";

import Link from "next/link";
import { useState } from "react";
import Img, { PhotoPending } from "@/ui/Img";
import HeightFilter, { heightQuery, inHeight, useHeightRange } from "@/ui/Products/HeightFilter";

export type ModelCard = {
  href: string;
  /** The same page opening with Rent selected. */
  rentHref: string;
  title: string;
  image: string | null;
  model: string;
  specs: [string, string][];
  buy: boolean;
  rent: boolean;
  height: number | null;
};

type Mode = "buy" | "rent";
const MAX_CARDS = 8;

/**
 * A range's machines in one grid with a Buy / Rent switch and a working-height slider: drag it
 * and the grid, the bar chart and the Buy/Rent counts follow. Each card shows the model number
 * and its key specs from the listing row. "See all" opens the buy or rent listing with the same
 * height range.
 */
export default function ModelShowcase({ label, models, listings }: { label: string; models: ModelCard[]; listings: Record<Mode, string> }) {
  const [height, setHeight] = useHeightRange();
  const modes = (["buy", "rent"] as const).filter((m) => models.some((c) => c[m]));
  const [active, setActive] = useState<Mode | undefined>(modes[0]);
  const mode = modes.find((m) => m === active) ?? modes[0];
  if (!mode) return null;

  const inRange = models.filter((c) => inHeight(c.height, height));
  const shown = inRange.filter((c) => c[mode]);
  const known = (list: ModelCard[]) => list.map((c) => c.height).filter((h): h is number => h != null);
  const verb = mode === "buy" ? "to buy" : "to rent";

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="default-margin">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">The range</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{label}</h2>
          </div>
          {modes.length > 1 && (
            <div role="tablist" aria-label="Buy or rent" className="inline-flex rounded-full bg-surface p-1 ring-1 ring-black/5">
              {modes.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={m === mode}
                  onClick={() => setActive(m)}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                    m === mode ? "bg-ink text-white shadow" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {m === "buy" ? "Buy" : "Rent"}{" "}
                  <span className="font-normal tabular-nums opacity-60">({inRange.filter((c) => c[m]).length})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {known(models).length > 2 && (
          <div className="mt-8 grid gap-6 rounded-md bg-surface p-5 ring-1 ring-black/5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-10 md:p-6">
            <div>
              <p className="text-lg font-semibold text-ink">How high do you need to work?</p>
              <p className="mt-1 text-sm text-ink-soft">
                Drag the handles to see the machines that reach it.{" "}
                <span className="font-semibold text-ink" aria-live="polite">
                  {shown.length} {shown.length === 1 ? "machine" : "machines"} {verb}
                </span>
                {height ? " in this height range." : "."}
              </p>
            </div>
            <HeightFilter all={known(models)} heights={known(models.filter((c) => c[mode]))} value={height} onChange={setHeight} />
          </div>
        )}

        {shown.length ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="tabpanel">
            {shown.slice(0, MAX_CARDS).map((c) => (
              <li key={c.href}>
                <Link
                  href={mode === "rent" ? c.rentHref : c.href}
                  className="group flex h-full flex-col overflow-hidden rounded-md bg-white no-underline ring-1 ring-black/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-black/20"
                >
                  <div className="relative aspect-[16/10] bg-surface sm:aspect-[4/3]">
                    {/* multiply: product shots on white blend into the card */}
                    {c.image ? (
                      <Img src={c.image} alt={c.title} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <PhotoPending />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    {c.model && <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">{c.model}</p>}
                    <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-ink">{c.title}</h3>
                    {c.specs.length > 0 && (
                      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 text-xs">
                        {c.specs.map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-ink-soft">{k}</dt>
                            <dd className="mt-0.5 text-sm font-semibold text-ink">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <span className="mt-auto pt-5 text-sm font-semibold text-ink">
                      View details <span aria-hidden className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-md bg-surface p-10 text-center" role="tabpanel">
            <p className="text-ink">
              No {label.toLowerCase()} {verb} in that height range.
            </p>
            <button type="button" onClick={() => setHeight(null)} className="btn-dark mt-5">
              Show all heights
            </button>
          </div>
        )}

        {shown.length > MAX_CARDS && (
          <div className="mt-10 text-center">
            <Link href={`${listings[mode]}${heightQuery(height)}`} className="btn-dark no-underline">
              See all {shown.length} {verb}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

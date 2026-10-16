"use client";

import Link from "next/link";
import { useState } from "react";
import Img, { PhotoPending } from "@/ui/Img";

export type ModelCard = { href: string; title: string; image: string | null; model: string; specs: [string, string][] };
export type ModelSet = { cards: ModelCard[]; total: number; href: string };

/**
 * A range's machines in one grid with a Buy / Rent switch (instead of two near-identical
 * grids). Each card shows the model number and its key specs from the listing row.
 */
export default function ModelShowcase({ label, buy, rent }: { label: string; buy: ModelSet | null; rent: ModelSet | null }) {
  const modes = [
    { key: "buy", name: "Buy", set: buy },
    { key: "rent", name: "Rent", set: rent },
  ].filter((m): m is { key: string; name: string; set: ModelSet } => !!m.set?.cards.length);
  const [active, setActive] = useState(modes[0]?.key);
  const current = modes.find((m) => m.key === active) ?? modes[0];
  if (!current) return null;

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
                  key={m.key}
                  type="button"
                  role="tab"
                  aria-selected={m.key === current.key}
                  onClick={() => setActive(m.key)}
                  className={`rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                    m.key === current.key ? "bg-ink text-white shadow" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {m.name} <span className="font-normal opacity-60">({m.set.total})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="tabpanel">
          {current.set.cards.map((c) => (
            <li key={c.href}>
              <Link
                href={c.href}
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

        {current.set.total > current.set.cards.length && (
          <div className="mt-10 text-center">
            <Link href={current.set.href} className="btn-dark no-underline">
              See all {current.set.total} {current.name === "Buy" ? "to buy" : "to rent"}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

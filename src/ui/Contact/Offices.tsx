"use client";

import { useState } from "react";

export type Office = {
  company: string;
  label: string;
  address: string;
  phones: string[];
  emails: string[];
  map: string | null;
};
export type Region = { name: string; cities: { name: string; offices: Office[] }[] };

function Row({ o }: { o: Office }) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-3">
      <div className="flex h-full flex-col items-center justify-center bg-ink px-6 py-10 text-center md:py-16">
        <p className="mb-2 text-lg text-white">{o.company}</p>
        <h3 className="text-2xl font-semibold text-[#ffeb3b]">{o.label}</h3>
      </div>
      <ul className="bg-[#ffeb3b] px-6 py-5">
        {[
          ["Address:", [o.address]],
          ["Phone:", o.phones],
          ["Email id:", o.emails],
        ].map(([k, vals], i) => (
          <li
            key={k as string}
            className={`grid grid-cols-[96px_1fr] gap-2 pb-2.5 ${i < 2 ? "mb-3.5 border-b border-[#737373]" : ""}`}
          >
            <span className="text-base font-semibold text-ink">{k}</span>
            <span className="min-w-0 text-sm leading-6 break-words text-ink">
              {(vals as string[]).map((v) =>
                k === "Phone:" ? (
                  <a key={v} href={`tel:${v.replace(/\s/g, "")}`} className="block text-ink no-underline hover:underline">
                    {v}
                  </a>
                ) : k === "Email id:" ? (
                  <a key={v} href={`mailto:${v}`} className="block text-ink no-underline hover:underline">
                    {v}
                  </a>
                ) : (
                  <span key={v} className="block">
                    {v}
                  </span>
                ),
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="h-full min-h-60 border-2 border-[#ffeb3b] p-0.5">
        {o.map && (
          <iframe
            src={o.map}
            title={`${o.label} map`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full min-h-60 w-full border-0"
          />
        )}
      </div>
    </div>
  );
}

export default function Offices({ regions }: { regions: Region[] }) {
  const [r, setR] = useState(0);
  const [c, setC] = useState(0);
  const region = regions[r];
  const city = region?.cities[c] ?? region?.cities[0];
  if (!region) return null;

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 border-b-2 border-ink">
        {regions.map((x, i) => (
          <button
            key={x.name}
            role="tab"
            aria-selected={i === r}
            onClick={() => {
              setR(i);
              setC(0);
            }}
            className={`py-3 text-lg font-bold tracking-wide transition-colors ${i === r ? "bg-ink text-brand" : "bg-surface text-ink hover:bg-brand"}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div role="tablist" className="mt-6 flex flex-wrap justify-center gap-2">
        {region.cities.map((x, i) => (
          <button
            key={x.name}
            role="tab"
            aria-selected={x === city}
            onClick={() => setC(i)}
            className={`rounded-full border px-5 py-1.5 text-sm font-semibold transition-colors ${x === city ? "border-brand bg-brand text-ink" : "border-neutral-300 bg-white text-ink-soft hover:border-brand"}`}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-col gap-8">
        {city?.offices.map((o) => <Row key={o.label} o={o} />)}
      </div>
    </div>
  );
}

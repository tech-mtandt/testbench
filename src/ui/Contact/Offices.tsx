"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Map as MapIcon, Mail, MapPin, Phone, X } from "lucide-react";
import { useState } from "react";
import Chip from "@/ui/kit/Chip";
import Segmented from "@/ui/kit/Segmented";

export type Office = {
  company: string;
  label: string;
  address: string;
  phones: string[];
  emails: string[];
  map: string | null;
};
export type Region = { name: string; cities: { name: string; offices: Office[] }[] };

const title = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

function OfficeCard({ o, city }: { o: Office; city: string }) {
  const [map, setMap] = useState(false);
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.company} ${o.address}`)}`;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="card flex flex-col overflow-hidden"
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] tracking-[0.12em] text-subtle uppercase">
              {city} · {o.company}
            </p>
            <h3 className="mt-2 text-xl">{o.label}</h3>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas">
            <MapPin className="h-[18px] w-[18px]" />
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{o.address}</p>
        <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
          {o.phones.map((p) => (
            <li key={p}>
              <a href={`tel:${p.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-8 items-center gap-2.5 font-mono text-[13px] text-ink no-underline hover:underline">
                <Phone className="h-4 w-4 text-muted" /> {p}
              </a>
            </li>
          ))}
          {o.emails.map((e) => (
            <li key={e} className="min-w-0">
              <a href={`mailto:${e}`} className="inline-flex min-h-8 max-w-full items-center gap-2.5 text-ink no-underline hover:underline">
                <Mail className="h-4 w-4 shrink-0 text-muted" /> <span className="truncate">{e}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <AnimatePresence initial={false}>
        {map && o.map && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="aspect-[4/3] bg-canvas">
              <iframe src={o.map} title={`${o.label} map`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full border-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex gap-2 border-t border-line p-3">
        {o.map && (
          <button
            type="button"
            onClick={() => setMap((v) => !v)}
            aria-expanded={map}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-canvas text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-white"
          >
            {map ? <X className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            {map ? "Hide map" : "Show map"}
          </button>
        )}
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line text-[13px] font-medium text-ink no-underline transition-colors hover:border-ink"
        >
          Directions <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </motion.article>
  );
}

/** Region switch (India / Overseas) → city chips → office cards. Maps load only when asked for. */
export default function Offices({ regions }: { regions: Region[] }) {
  const [r, setR] = useState(regions[0]?.name ?? "");
  const [c, setC] = useState<string | null>(null);
  const region = regions.find((x) => x.name === r) ?? regions[0];
  if (!region) return null;
  const city = region.cities.find((x) => x.name === c) ?? null;
  const shown = city ? [city] : region.cities;
  const count = (x: Region) => x.cities.reduce((n, ci) => n + ci.offices.length, 0);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Segmented
          ariaLabel="Region"
          value={region.name}
          onChange={(v) => {
            setR(v);
            setC(null);
          }}
          options={regions.map((x) => ({
            value: x.name,
            label: (
              <>
                {title(x.name)} <span className="ml-1 font-mono text-[11px] text-subtle">{count(x)}</span>
              </>
            ),
          }))}
        />
        <div className="no-scrollbar -mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Chip active={!city} onClick={() => setC(null)}>
            All cities
          </Chip>
          {region.cities.map((x) => (
            <Chip key={x.name} active={city?.name === x.name} onClick={() => setC(x.name)} count={x.offices.length}>
              {x.name}
            </Chip>
          ))}
        </div>
      </div>
      <motion.div layout className="mt-8 grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.flatMap((ci) => ci.offices.map((o) => <OfficeCard key={`${region.name}-${ci.name}-${o.label}`} o={o} city={ci.name} />))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

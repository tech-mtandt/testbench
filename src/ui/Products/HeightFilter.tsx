"use client";

import { useState, useSyncExternalStore } from "react";

/** [lowest, highest] in metres; null = any height (machines without a listed height included). */
export type HeightRange = [number, number] | null;

/** Whether a machine of height `h` is in the range. */
export const inHeight = (h: number | null | undefined, r: HeightRange) => !r || (h != null && h >= r[0] - 1e-9 && h <= r[1] + 1e-9);

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const PARAM = "height";
const parse = (s: string | null): HeightRange => {
  const m = s?.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lo = Number(m[1]);
  const hi = Number(m[2]);
  return lo <= hi ? [lo, hi] : null;
};
/** "?height=6-24" for a link to another page with the same range. */
export const heightQuery = (r: HeightRange) => (r ? `?${PARAM}=${fmt(r[0])}-${fmt(r[1])}` : "");

const noSubscription = () => () => {};
const readParam = () => new URLSearchParams(window.location.search).get(PARAM);

/**
 * The height range, kept in the address (?height=6-24) so a filtered page can be shared,
 * reloaded or linked to (the range pages' "See all" button carries it to the listing).
 */
export function useHeightRange(): [HeightRange, (r: HeightRange) => void] {
  const fromUrl = useSyncExternalStore(noSubscription, readParam, () => null);
  const [picked, setPicked] = useState<HeightRange | undefined>(undefined);
  const set = (r: HeightRange) => {
    setPicked(r);
    const url = new URL(window.location.href);
    if (r) url.searchParams.set(PARAM, `${fmt(r[0])}-${fmt(r[1])}`);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url);
  };
  return [picked === undefined ? parse(fromUrl) : picked, set];
}

/** Bar width in metres: a round step giving at most ~24 bars. */
function binStep(span: number) {
  return [0.5, 1, 2, 5, 10, 20, 50].find((s) => span / s <= 24) ?? 100;
}

/**
 * Working-height filter: a histogram of how many machines there are at each height (the bars
 * inside the chosen range light up) over a two-handle slider. Dragging both handles to the ends
 * means any height. `all` sets the scale (every machine of the range, so it stays put when
 * switching Buy/Rent); `heights` are the machines counted in the bars.
 */
export default function HeightFilter({
  all,
  heights,
  value,
  onChange,
  label = "Working height",
  showLabel = true,
}: {
  all: number[];
  heights: number[];
  value: HeightRange;
  onChange: (r: HeightRange) => void;
  label?: string;
  /** Off where a heading above already names it. */
  showLabel?: boolean;
}) {
  if (all.length < 2) return null;
  const step = binStep(Math.max(...all) - Math.min(...all));
  const min = Math.floor(Math.min(...all) / step) * step;
  const max = Math.max(min + step, Math.ceil(Math.max(...all) / step) * step);
  if (max - min < 1) return null;
  const [lo, hi] = value ? [Math.max(min, value[0]), Math.min(max, value[1])] : [min, max];

  const bins = Array.from({ length: Math.round((max - min) / step) }, (_, i) => {
    const from = min + i * step;
    const last = i === Math.round((max - min) / step) - 1;
    const n = heights.filter((h) => h >= from && (last ? h <= from + step : h < from + step)).length;
    return { from, to: from + step, n };
  });
  const peak = Math.max(1, ...bins.map((b) => b.n));
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  // Thumbs are 20px: their centres run from 10px to (width - 10px), so the bars and the
  // highlighted track use the same inset.
  const at = (v: number) => `calc(10px + (100% - 20px) * ${pct(v) / 100})`;

  const set = (a: number, b: number) => onChange(a <= min && b >= max ? null : [a, b]);
  const slide = (which: 0 | 1, v: number) => {
    const gap = 0.5;
    if (which === 0) set(Math.min(v, hi - gap), hi);
    else set(lo, Math.max(v, lo + gap));
  };

  return (
    <div className="select-none">
      <div className="flex items-baseline justify-between gap-3">
        {showLabel && <span className="text-sm font-semibold text-ink">{label}</span>}
        <span className="ml-auto text-sm tabular-nums text-ink" aria-live="polite">
          {value ? `${fmt(lo)} – ${fmt(hi)} m` : "Any height"}
        </span>
      </div>

      <div className="relative mt-3 h-14" aria-hidden>
        <div className="absolute inset-y-0 left-[10px] right-[10px] flex items-end gap-[2px]">
          {bins.map((b) => {
            const lit = b.n > 0 && b.to > lo && b.from < hi;
            return (
              <div
                key={b.from}
                title={`${b.n} machine${b.n === 1 ? "" : "s"}, ${fmt(b.from)}–${fmt(b.to)} m`}
                className={`flex-1 rounded-t-[3px] transition-[height,background-color] duration-300 ${lit ? "bg-brand" : "bg-black/10"}`}
                style={{ height: b.n ? `${Math.max(12, (b.n / peak) * 100)}%` : "3px" }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative h-6">
        <div className="absolute inset-x-[10px] top-1/2 h-1 -translate-y-1/2 rounded-full bg-black/10" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ink"
          style={{ left: at(lo), right: `calc(100% - ${at(hi)})` }}
        />
        <input
          type="range"
          className="range-dual"
          min={min}
          max={max}
          step={0.5}
          value={lo}
          onChange={(e) => slide(0, Number(e.target.value))}
          aria-label={`Lowest ${label.toLowerCase()}`}
          aria-valuetext={`${fmt(lo)} metres`}
        />
        <input
          type="range"
          className="range-dual"
          min={min}
          max={max}
          step={0.5}
          value={hi}
          onChange={(e) => slide(1, Number(e.target.value))}
          aria-label={`Highest ${label.toLowerCase()}`}
          aria-valuetext={`${fmt(hi)} metres`}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-ink-soft">
        <span>{fmt(min)} m</span>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="font-semibold text-ink underline underline-offset-2">
            Any height
          </button>
        )}
        <span>{fmt(max)} m</span>
      </div>
    </div>
  );
}

"use client";

import { useSyncExternalStore } from "react";

/** One compared item as stored per browser (enough to draw the tray without a fetch). */
export type CompareEntry = { slug: string; title: string; image: string | null };

const KEY = "mt-compare";
export const COMPARE_MAX = 4;
const EMPTY: CompareEntry[] = [];
let cache: { raw: string | null; list: CompareEntry[] } = { raw: null, list: EMPTY };

function read(): CompareEntry[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let list: CompareEntry[] = EMPTY;
    try {
      const v = JSON.parse(raw || "[]");
      if (Array.isArray(v))
        list = v
          .filter((x): x is CompareEntry => !!x && typeof x.slug === "string")
          .map((x) => ({ slug: x.slug, title: String(x.title ?? x.slug), image: typeof x.image === "string" ? x.image : null }))
          .slice(0, COMPARE_MAX);
    } catch {}
    cache = { raw, list };
  }
  return cache.list;
}

export const readCompare = read;

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function writeCompare(list: CompareEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, COMPARE_MAX)));
  } catch {}
  listeners.forEach((l) => l());
}

export const compareHref = (list: { slug: string }[]) =>
  list.length ? `/products/compare?items=${list.map((x) => x.slug).join(",")}` : "/products/compare";

/** Compare selection shared by cards, the tray, detail pages and /products/compare. */
export function useCompare() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    list,
    has: (slug: string) => list.some((x) => x.slug === slug),
    full: list.length >= COMPARE_MAX,
    toggle: (e: CompareEntry) => {
      const cur = read();
      if (cur.some((x) => x.slug === e.slug)) writeCompare(cur.filter((x) => x.slug !== e.slug));
      else if (cur.length < COMPARE_MAX) writeCompare([...cur, e]);
    },
    remove: (slug: string) => writeCompare(read().filter((x) => x.slug !== slug)),
    clear: () => writeCompare([]),
  };
}

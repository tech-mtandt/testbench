"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "mtandt-compare";
export const COMPARE_MAX = 4;
const EMPTY: string[] = [];
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {}
  if (raw !== cache.raw) {
    let list: string[] = EMPTY;
    try {
      const v = JSON.parse(raw || "[]");
      if (Array.isArray(v)) list = v.filter((x) => typeof x === "string").slice(0, COMPARE_MAX);
    } catch {}
    cache = { raw, list };
  }
  return cache.list;
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function writeCompare(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, COMPARE_MAX)));
  } catch {}
  listeners.forEach((l) => l());
}

/** Compare selection shared across listing, search and compare pages (per browser). */
export function useCompare() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback(
    (slug: string) => {
      const cur = read();
      if (cur.includes(slug)) writeCompare(cur.filter((s) => s !== slug));
      else if (cur.length < COMPARE_MAX) writeCompare([...cur, slug]);
      else alert(`You can compare up to ${COMPARE_MAX} products.`);
    },
    [],
  );
  return { list, toggle, clear: () => writeCompare([]) };
}

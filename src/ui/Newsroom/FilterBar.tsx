"use client";

import { Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Segmented from "@/ui/kit/Segmented";

type T = "all" | "articles" | "press" | "events" | "gallery";

const LABELS: Record<T, string> = { all: "All", articles: "Articles", press: "Press", events: "Events", gallery: "Gallery" };

const build = (type: T, q: string) => {
  const p = new URLSearchParams();
  if (type !== "all") p.set("type", type);
  if (q && type !== "gallery") p.set("q", q);
  const s = p.toString();
  return `/media${s ? `?${s}` : ""}`;
};

/** Sticky newsroom filter: type segmented control + title search, both URL state (?type=, ?q=). */
export default function FilterBar({ type, q, counts }: { type: T; q: string; counts: Record<T, number> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<T>(type);
  const [text, setText] = useState(q);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // follow back/forward navigation
  useEffect(() => setActive(type), [type]);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (document.activeElement !== input.current) setText(q);
  }, [q]);

  const go = (t: T, query: string) => start(() => router.push(build(t, query), { scroll: false }));

  const onType = (t: T) => {
    setActive(t);
    go(t, text.trim());
  };
  const onText = (v: string) => {
    setText(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => start(() => router.replace(build(active, v.trim()), { scroll: false })), 350);
  };

  const options = (Object.keys(LABELS) as T[]).map((k) => ({
    value: k,
    label: (
      <span className="inline-flex items-center gap-1.5">
        {LABELS[k]}
        <span className="hidden font-mono text-[10px] text-subtle tabular sm:inline">{counts[k]}</span>
      </span>
    ),
  }));

  return (
    <div className="sticky top-[76px] z-30 sm:top-20">
      <div className="container-x">
        <div className="glass flex flex-col gap-2 rounded-[var(--radius-card)] p-2 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:rounded-full">
          <div className="no-scrollbar -mx-0.5 min-w-0 overflow-x-auto px-0.5">
            <Segmented options={options} value={active} onChange={onType} size="sm" ariaLabel="Content type" className="w-max" />
          </div>
          <form
            role="search"
            action="/media"
            onSubmit={(e) => {
              e.preventDefault();
              clearTimeout(timer.current);
              go(active, text.trim());
            }}
            className={`relative min-w-0 flex-1 md:ml-auto md:max-w-xs ${active === "gallery" ? "hidden md:block md:invisible" : ""}`}
          >
            {active !== "all" && <input type="hidden" name="type" value={active} />}
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
              ref={input}
              type="search"
              name="q"
              value={text}
              onChange={(e) => onText(e.target.value)}
              placeholder={active === "all" ? "Search the newsroom" : `Search ${LABELS[active].toLowerCase()}`}
              aria-label="Search titles"
              className="h-10 w-full rounded-full border border-line bg-white pr-10 pl-10 text-sm text-ink placeholder:text-subtle focus:border-ink focus:shadow-[0_0_0_4px_rgb(247_228_51/0.35)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center">
              {pending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin text-subtle" aria-label="Loading" />
              ) : (
                text && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => onText("")}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )
              )}
            </span>
          </form>
        </div>
      </div>
    </div>
  );
}

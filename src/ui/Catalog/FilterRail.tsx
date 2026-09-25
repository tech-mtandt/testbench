"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { useFilters } from "./FilterState";

export type RailGroup = {
  param: string;
  label: string;
  options: { value: string; label: string; count: number }[];
  /** single-select (radio) rather than multi-select (checkbox) */
  single?: boolean;
};

const LIMIT = 6;

function Group({ g }: { g: RailGroup }) {
  const { list, get, set, toggle } = useFilters();
  const [all, setAll] = useState(false);
  const selected = g.single ? [get(g.param)].filter(Boolean) : list(g.param);
  const visible = all ? g.options : g.options.slice(0, LIMIT);
  return (
    <fieldset className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between">
        <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{g.label}</legend>
        {selected.length > 0 && (
          <button type="button" onClick={() => set({ [g.param]: null })} className="text-[12px] text-muted hover:text-ink">
            Clear
          </button>
        )}
      </div>
      <ul className="space-y-0.5">
        {visible.map((o) => {
          const on = selected.includes(o.value);
          const empty = o.count === 0 && !on;
          return (
            <li key={o.value}>
              <button
                type="button"
                role={g.single ? "radio" : "checkbox"}
                aria-checked={on}
                disabled={empty}
                onClick={() => (g.single ? set({ [g.param]: on ? null : o.value }) : toggle(g.param, o.value))}
                className="group/opt -mx-2 flex min-h-10 w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors hover:bg-ink/[0.04] disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <span
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center border transition-colors ${g.single ? "rounded-full" : "rounded-[5px]"} ${
                    on ? "border-ink bg-ink text-white" : "border-line-strong bg-white group-hover/opt:border-ink/50"
                  }`}
                >
                  {on && (g.single ? <span className="h-1.5 w-1.5 rounded-full bg-brand" /> : <Check className="h-3 w-3" strokeWidth={3} />)}
                </span>
                <span className={`min-w-0 flex-1 truncate ${on ? "font-medium text-ink" : "text-ink-2"}`}>{o.label}</span>
                <span className="font-mono text-[11px] text-subtle tabular">{o.count}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {g.options.length > LIMIT && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-[13px] font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          {all ? "Show less" : `Show all ${g.options.length}`}
        </button>
      )}
    </fieldset>
  );
}

/** Facet groups (desktop rail and the mobile filter sheet share this). */
export default function FilterRail({ groups }: { groups: RailGroup[] }) {
  if (!groups.length) return <p className="text-sm text-muted">No further filters for this selection.</p>;
  return (
    <div>
      {groups.map((g) => (
        <Group key={g.param} g={g} />
      ))}
    </div>
  );
}

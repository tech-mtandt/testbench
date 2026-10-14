"use client";

import { useState } from "react";
import type { ReturnTab as Tab } from "@/content/investor-relations";

/** One tab per company; inside it, one sub-tab per group (Annual Report, Annual Return, CSR...). */
export default function ReturnTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [sub, setSub] = useState(0);
  return (
    <div className="max-w-[750px]">
      <div role="tablist" className="grid grid-cols-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => {
              setActive(i);
              setSub(0);
            }}
            className={`border-b-2 px-3 py-2 text-base transition-colors md:text-lg ${
              active === i ? "border-brand bg-white text-ink" : "border-transparent bg-[#efefef] text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.label} role="tabpanel" hidden={active !== i} className="pt-6">
          <div role="tablist" className="mb-6 flex flex-wrap gap-2">
            {t.groups.map((g, j) => (
              <button
                key={g.title}
                role="tab"
                aria-selected={active === i && sub === j}
                onClick={() => setSub(j)}
                className={`rounded-full border px-5 py-1.5 text-sm font-semibold transition-colors ${
                  active === i && sub === j
                    ? "border-brand bg-brand text-ink"
                    : "border-neutral-300 bg-white text-ink-soft hover:border-brand"
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
          {t.groups.map((g, j) => (
            <div key={g.title} role="tabpanel" hidden={active !== i || sub !== j}>
              <h2 className="sr-only">{g.title}</h2>
              <ul className="space-y-2">
                {g.docs.map((d) => (
                  <li key={d.href + d.label} className="flex items-center gap-3 text-[15px]">
                    <span className="h-1.5 w-1.5 shrink-0 bg-brand" />
                    <a href={d.href} target="_blank" rel="noopener" className="text-ink no-underline hover:underline">
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

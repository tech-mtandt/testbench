"use client";

import { useState } from "react";

type Tab = { label: string; groups: { title: string; docs: { label: string; href: string }[] }[] };

export default function ReturnTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="max-w-[750px]">
      <div role="tablist" className="grid grid-cols-2">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
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
          {t.groups.map((g) => (
            <div key={g.title} className="mb-6">
              <h2 className="mb-3 text-xl font-medium text-ink">{g.title}</h2>
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

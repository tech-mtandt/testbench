"use client";

import { useState } from "react";

type Props = { specs: string[][]; features: string; benefits: string; download: string | null };

export default function ProductTabs({ specs, features, benefits, download }: Props) {
  const tabs = [
    { id: "specs", label: "Specifications" },
    { id: "features", label: "Features", hide: !features },
    { id: "benefits", label: "Benefits", hide: !benefits },
  ].filter((t) => !t.hide);
  const [active, setActive] = useState(tabs[0].id);

  return (
    <div>
      <div role="tablist" className="no-scrollbar flex gap-8 overflow-x-auto border-b border-transparent">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`shrink-0 border-b-2 pb-1.5 text-[15px] transition-colors ${
              active === t.id ? "border-brand font-semibold text-ink" : "border-transparent text-ink hover:border-brand/60"
            }`}
          >
            {t.label}
          </button>
        ))}
        {download && (
          <a href={download} download className="shrink-0 border-b-2 border-transparent pb-1.5 text-[15px] text-ink no-underline hover:border-brand/60">
            Downloads
          </a>
        )}
      </div>
      <div role="tabpanel" className="mt-6 bg-white p-2 shadow-[0_0_12px_rgba(0,0,0,0.08)]">
        {active === "specs" && (
          <table className="w-full border-collapse text-sm">
            <tbody>
              {specs.map(([k, v], i) => (
                <tr key={i}>
                  <td className="w-2/5 border border-neutral-200 bg-surface px-3 py-2.5 align-top font-semibold text-ink-soft">
                    {k}
                  </td>
                  <td className="border border-neutral-200 px-3 py-2.5 align-top text-ink-soft">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {active === "features" && (
          <div className="prose-legacy px-3 pt-3 text-sm" dangerouslySetInnerHTML={{ __html: features }} />
        )}
        {active === "benefits" && (
          <div className="prose-legacy px-3 pt-3 text-sm" dangerouslySetInnerHTML={{ __html: benefits }} />
        )}
      </div>
    </div>
  );
}

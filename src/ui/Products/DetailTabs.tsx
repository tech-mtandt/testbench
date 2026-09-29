"use client";

import { useState } from "react";
import Img from "@/ui/Img";
import type { Product } from "@/content/products";

type Pane = { id: string; label: string; body: React.ReactNode };

export default function DetailTabs({ p }: { p: Pick<Product, "specs" | "featuresHtml" | "optionsHtml" | "applications" | "download" | "charts" | "model"> }) {
  const panes: Pane[] = [
    {
      id: "specs",
      label: "Specifications",
      body: (
        <table className="w-full text-sm">
          <tbody>
            {p.specs.map(([k, v], i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-[#f2f2f2]" : ""}>
                <th scope="row" className="w-1/2 px-2 py-2.5 text-left font-semibold text-ink-soft md:px-3">
                  {k}
                </th>
                <td className="px-2 py-2.5 text-ink-soft md:px-3">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
  ];
  if (p.featuresHtml)
    panes.push({ id: "features", label: "Standard Features", body: <Html html={p.featuresHtml} /> });
  if (p.optionsHtml) panes.push({ id: "options", label: "Options", body: <Html html={p.optionsHtml} /> });
  if (p.applications.length)
    panes.push({
      id: "applications",
      label: "Applications",
      body: (
        <table className="w-full max-w-xl text-sm">
          <thead>
            <tr className="bg-[#f2f2f2]">
              <th className="w-20 px-3 py-2.5 text-left">No.</th>
              <th className="px-3 py-2.5 text-left">Name</th>
            </tr>
          </thead>
          <tbody>
            {p.applications.map((a, i) => (
              <tr key={i} className={i % 2 ? "bg-[#f2f2f2]" : ""}>
                <td className="px-3 py-2.5 text-ink-soft">{i + 1}</td>
                <td className="px-3 py-2.5 text-ink-soft">{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  if (p.charts.length)
    panes.push({
      id: "chart",
      label: "Chart",
      body: (
        <div className="flex flex-wrap gap-6">
          {p.charts.map((c) => (
            <Img key={c} src={c} alt="Load chart" className="h-auto max-w-full" />
          ))}
        </div>
      ),
    });

  const [active, setActive] = useState(panes[0].id);
  const pane = panes.find((x) => x.id === active) ?? panes[0];
  const tabCls = (on: boolean) =>
    `shrink-0 border-b-2 pb-2 text-[15px] transition-colors ${on ? "border-brand font-semibold text-ink" : "border-transparent text-ink hover:border-brand/50"}`;

  return (
    <section className="mt-12">
      <div role="tablist" className="no-scrollbar flex gap-8 overflow-x-auto md:gap-10">
        {panes.slice(0, 1).concat(panes.slice(1).filter((x) => x.id !== "chart")).map((x) => (
          <button key={x.id} role="tab" type="button" aria-selected={x.id === pane.id} onClick={() => setActive(x.id)} className={tabCls(x.id === pane.id)}>
            {x.label}
          </button>
        ))}
        {p.download && (
          <a href={p.download} download={p.model ? `${p.model}.pdf` : undefined} target="_blank" rel="noopener" className={`${tabCls(false)} no-underline`}>
            Downloads
          </a>
        )}
        {panes
          .filter((x) => x.id === "chart")
          .map((x) => (
            <button key={x.id} role="tab" type="button" aria-selected={x.id === pane.id} onClick={() => setActive(x.id)} className={tabCls(x.id === pane.id)}>
              {x.label}
            </button>
          ))}
      </div>
      <div role="tabpanel" className="mt-5 overflow-x-auto border border-neutral-100 bg-white p-4 shadow-[0_0_10px_rgba(0,0,0,0.06)] md:p-5">
        {pane.body}
      </div>
    </section>
  );
}

const Html = ({ html }: { html: string }) => (
  <div className="prose-legacy text-sm [&_li]:mb-1" dangerouslySetInnerHTML={{ __html: html }} />
);

"use client";

import { ArrowDownToLine, FileText } from "lucide-react";
import Tabs from "@/ui/kit/Tabs";
import type { IrDoc } from "./lib";

export type IrCompany = { label: string; groups: { title: string; docs: IrDoc[] }[] };

function DocRow({ d }: { d: IrDoc }) {
  return (
    <li>
      <a
        href={d.href}
        target="_blank"
        rel="noopener"
        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 no-underline transition-colors hover:bg-canvas sm:grid-cols-[auto_88px_minmax(0,1fr)_140px_auto] sm:px-5"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-canvas text-ink transition-colors group-hover:bg-brand">
          <FileText className="h-[18px] w-[18px]" />
        </span>
        <span className="hidden font-mono text-sm text-ink tabular sm:block">{d.year ?? "—"}</span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium text-ink">{d.label}</span>
          <span className="mt-0.5 block font-mono text-[11px] text-subtle sm:hidden">
            {[d.year, d.type].filter(Boolean).join(" · ")} · PDF
          </span>
        </span>
        <span className="hidden sm:block">
          <span className="inline-flex rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-2">{d.type}</span>
        </span>
        <span className="flex items-center gap-2 text-[13px] text-muted group-hover:text-ink">
          <span className="hidden font-mono text-[11px] lg:inline">PDF</span>
          <ArrowDownToLine className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
        </span>
      </a>
    </li>
  );
}

/** Two group companies as tabs; each lists its statutory filings as a downloadable table. */
export default function InvestorRelations({ companies }: { companies: IrCompany[] }) {
  return (
    <Tabs
      items={companies.map((c) => ({
        id: c.label,
        label: c.label,
        count: c.groups.reduce((n, g) => n + g.docs.length, 0),
        content: (
          <div className="space-y-8">
            {c.groups.map((g) => (
              <div key={g.title}>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="text-lg">{g.title}</h3>
                  <p className="font-mono text-[11px] text-subtle">{g.docs.length} documents</p>
                </div>
                <ul className="card divide-y divide-line overflow-hidden">
                  {g.docs.map((d) => (
                    <DocRow key={d.href} d={d} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
      }))}
    />
  );
}

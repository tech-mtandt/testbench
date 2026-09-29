"use client";

import Image from "next/image";
import { useState } from "react";

export type SpecRow = { label: string; value: string };
export type DownloadItem = { label: string; url: string };

type TabKey =
  | "specifications"
  | "standardFeatures"
  | "options"
  | "applications"
  | "downloads"
  | "chart";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={`${index}-${item}`} className="flex gap-2">
          <span className="text-primary-yellow">&bull;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductTabs({
  specifications,
  standardFeatures,
  options,
  applications,
  downloads,
  chartImageUrl,
  chartImageAlt,
}: {
  specifications: SpecRow[];
  standardFeatures: string[];
  options: string[];
  applications: string[];
  downloads: DownloadItem[];
  chartImageUrl: string | null;
  chartImageAlt: string;
}) {
  const tabs: { key: TabKey; label: string }[] = [
    specifications.length > 0 ? { key: "specifications", label: "Specifications" } : null,
    standardFeatures.length > 0 ? { key: "standardFeatures", label: "Standard Features" } : null,
    options.length > 0 ? { key: "options", label: "Options" } : null,
    applications.length > 0 ? { key: "applications", label: "Applications" } : null,
    downloads.length > 0 ? { key: "downloads", label: "Downloads" } : null,
    chartImageUrl ? { key: "chart", label: "Chart" } : null,
  ].filter((tab): tab is { key: TabKey; label: string } => Boolean(tab));

  const [active, setActive] = useState<TabKey | null>(tabs[0]?.key ?? null);

  if (tabs.length === 0 || !active) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-8 border-b border-black/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`pb-3 text-sm font-semibold ${
              active === tab.key
                ? "border-b-2 border-primary-yellow text-black"
                : "text-black/50 hover:text-black/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {active === "specifications" && (
          <div className="border border-black/10">
            {specifications.map((row, index) => (
              <div
                key={`${row.label}-${index}`}
                className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index % 2 === 0 ? "bg-black/[0.03]" : "bg-white"
                }`}
              >
                <p className="font-semibold text-black">{row.label}</p>
                <p className="text-black/70">{row.value}</p>
              </div>
            ))}
          </div>
        )}

        {active === "standardFeatures" && <BulletList items={standardFeatures} />}
        {active === "options" && <BulletList items={options} />}
        {active === "applications" && <BulletList items={applications} />}

        {active === "downloads" && (
          <ul className="flex flex-col gap-3">
            {downloads.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-black underline underline-offset-2 hover:text-black/70"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {active === "chart" && chartImageUrl && (
          <div className="relative h-[420px] w-full max-w-2xl">
            <Image
              src={chartImageUrl}
              alt={chartImageAlt}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        )}
      </div>
    </div>
  );
}

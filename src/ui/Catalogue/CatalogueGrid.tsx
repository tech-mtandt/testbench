"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

export type CatalogueItem = {
  id: number;
  title: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  posterUrl: string | null;
  posterAlt: string | null;
  documentUrl: string | null;
};

const ALL = "";

function uniqueSorted(values: (string | null)[]) {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export default function CatalogueGrid({
  catalogues,
}: {
  catalogues: CatalogueItem[];
}) {
  const [category, setCategory] = useState(ALL);
  const [subcategory, setSubcategory] = useState(ALL);
  const [brand, setBrand] = useState(ALL);

  const categories = useMemo(
    () => uniqueSorted(catalogues.map((c) => c.category)),
    [catalogues],
  );
  const subcategories = useMemo(
    () => uniqueSorted(catalogues.map((c) => c.subcategory)),
    [catalogues],
  );
  const brands = useMemo(
    () => uniqueSorted(catalogues.map((c) => c.brand)),
    [catalogues],
  );

  const filtered = useMemo(
    () =>
      catalogues.filter(
        (c) =>
          (category === ALL || c.category === category) &&
          (subcategory === ALL || c.subcategory === subcategory) &&
          (brand === ALL || c.brand === brand),
      ),
    [catalogues, category, subcategory, brand],
  );

  const hasFilters = Boolean(category || subcategory || brand);

  function resetAll() {
    setCategory(ALL);
    setSubcategory(ALL);
    setBrand(ALL);
  }

  const selectClass =
    "w-56 border border-black/30 bg-white px-4 py-2 text-sm text-black/80 focus:border-primary-yellow focus:outline-none";

  return (
    <div className="flex flex-col gap-8">
      <div className="default-margin relative flex flex-wrap items-center justify-center gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={selectClass}
        >
          <option value={ALL}>Choose Category</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          className={selectClass}
        >
          <option value={ALL}>Choose Sub Category</option>
          {subcategories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className={selectClass}
        >
          <option value={ALL}>Choose Brand</option>
          {brands.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={resetAll}
          disabled={!hasFilters}
          className="bg-primary-yellow px-6 py-2 text-sm font-bold underline underline-offset-2 transition-opacity disabled:cursor-not-allowed disabled:opacity-50 md:absolute md:right-4"
        >
          Reset All
        </button>
      </div>

      <div className="default-margin flex flex-col gap-6">
        <h2 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
          Catalogues
        </h2>

        {filtered.length === 0 ? (
          <p className="text-black/60">
            No catalogues match the selected filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((item) => (
              <a
                key={item.id}
                href={item.documentUrl ?? undefined}
                target={item.documentUrl ? "_blank" : undefined}
                rel={item.documentUrl ? "noopener noreferrer" : undefined}
                className="group flex flex-col border border-black/10 bg-white transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5">
                  {item.posterUrl && (
                    <Image
                      src={item.posterUrl}
                      alt={item.posterAlt || item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 -translate-y-1 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      <path d="M12 4v12" />
                      <path d="M6 12l6 6 6-6" />
                      <path d="M5 20h14" />
                    </svg>
                  </div>
                </div>
                <p className="p-4 text-center font-semibold">{item.title}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

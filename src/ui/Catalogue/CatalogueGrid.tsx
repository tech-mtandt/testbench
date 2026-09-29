"use client";

import { useMemo, useState } from "react";
import FallbackImg from "./FallbackImg";
import Modal from "@/ui/Modal";
import { DownloadIcon } from "@/ui/Icons";
import DownloadGate from "./DownloadGate";

export type CatalogueItem = {
  id: number | string;
  title: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  posterUrl: string | null;
  /** Local legacy copy, used if the Payload media URL fails to load. */
  fallbackPosterUrl?: string | null;
  documentUrl: string | null;
};

const uniq = (values: (string | null)[]) =>
  Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort((a, b) => a.localeCompare(b));

export default function CatalogueGrid({ catalogues, categories }: { catalogues: CatalogueItem[]; categories: string[] }) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [active, setActive] = useState<CatalogueItem | null>(null);

  const inCat = useMemo(() => catalogues.filter((c) => !category || c.category === category), [catalogues, category]);
  const subcategories = useMemo(() => (category ? uniq(inCat.map((c) => c.subcategory)) : []), [category, inCat]);
  const inSub = useMemo(() => inCat.filter((c) => !subcategory || c.subcategory === subcategory), [inCat, subcategory]);
  const brands = useMemo(() => (category ? uniq(inSub.map((c) => c.brand)) : []), [category, inSub]);
  const filtered = useMemo(() => inSub.filter((c) => !brand || c.brand === brand), [inSub, brand]);

  const select = "w-full appearance-auto border border-neutral-500 bg-white px-3 py-2 text-sm text-ink-soft focus:border-ink focus:outline-none";

  return (
    <>
      <div className="default-margin mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_repeat(3,220px)_1fr] lg:gap-6">
        <span className="hidden lg:block" />
        <select
          aria-label="Choose Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubcategory("");
            setBrand("");
          }}
          className={select}
        >
          <option value="">Choose Category</option>
          {categories.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select
          aria-label="Choose Sub Category"
          value={subcategory}
          onChange={(e) => {
            setSubcategory(e.target.value);
            setBrand("");
          }}
          className={select}
        >
          <option value="">Choose Sub Category</option>
          {subcategories.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select aria-label="Choose Brand" value={brand} onChange={(e) => setBrand(e.target.value)} className={select}>
          <option value="">Choose Brand</option>
          {brands.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <div>
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setSubcategory("");
              setBrand("");
            }}
            className="rounded-full border border-[#ffe61c] bg-[#ffe61c] px-6 py-1.5 text-[15px] font-bold text-black underline shadow-sm"
          >
            Reset All
          </button>
        </div>
      </div>

      <section className="default-margin pb-12">
        <h2 className="mt-5 text-xl font-semibold text-ink">Catalogues</h2>
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-ink-soft">No catalogues found for the selected filters.</p>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="group mt-8 mb-4 flex flex-col overflow-hidden rounded-[3px] bg-white text-center shadow-[0_2px_4px_rgba(22,23,24,0.16)]"
              >
                <span className="relative block h-[383px] w-full overflow-hidden bg-neutral-100">
                  <FallbackImg src={item.posterUrl} fallback={item.fallbackPosterUrl} alt={item.title} className="h-full w-full object-cover" />
                  <span className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex items-center gap-2 bg-brand px-8 py-2.5 text-sm font-semibold text-ink">
                      <DownloadIcon className="h-4 w-4" /> Download
                    </span>
                  </span>
                </span>
                <span className="block px-3 py-3 text-[15px] font-semibold text-ink">{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title="Download Form">
        {active && <DownloadGate key={active.id} title={active.title} href={active.documentUrl} />}
      </Modal>
    </>
  );
}

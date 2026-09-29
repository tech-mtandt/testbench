"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ProductItem = {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  imageAlt: string;
  condition: string | null;
  inStock: boolean;
  country: string | null;
  category: string | null;
  subcategory: string | null;
  primaryType: string | null;
  powerType: string | null;
  modelNo: string | null;
  workingHeight: number | null;
  maxLiftingCapacity: number | null;
};

type SortKey =
  | "capacity-desc"
  | "capacity-asc"
  | "height-desc"
  | "height-asc"
  | "title-asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "capacity-desc", label: "Lifting Capacity (DESC)" },
  { value: "capacity-asc", label: "Lifting Capacity (ASC)" },
  { value: "height-desc", label: "Working Height (DESC)" },
  { value: "height-asc", label: "Working Height (ASC)" },
  { value: "title-asc", label: "Name (A-Z)" },
];

function uniqueSorted(values: (string | null)[]) {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort(
    (a, b) => a.localeCompare(b),
  );
}

function toggle(set: Set<string>, value: string) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="border border-black/10 bg-white p-4">
      <p className="mb-3 text-xs font-bold tracking-wide text-black/70 uppercase">
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex cursor-pointer items-center gap-2 text-sm text-black/80"
          >
            <input
              type="checkbox"
              checked={selected.has(option)}
              onChange={() => onToggle(option)}
              className="h-4 w-4 accent-primary-yellow"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ProductsGrid({ products }: { products: ProductItem[] }) {
  const [condition, setCondition] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [country, setCountry] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState<Set<string>>(new Set());
  const [subcategory, setSubcategory] = useState<Set<string>>(new Set());
  const [primaryType, setPrimaryType] = useState<Set<string>>(new Set());
  const [powerType, setPowerType] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("capacity-desc");
  const [compared, setCompared] = useState<Set<number>>(new Set());

  const conditions = useMemo(() => uniqueSorted(products.map((p) => p.condition)), [products]);
  const countries = useMemo(() => uniqueSorted(products.map((p) => p.country)), [products]);
  const categories = useMemo(() => uniqueSorted(products.map((p) => p.category)), [products]);
  const subcategories = useMemo(
    () => uniqueSorted(products.map((p) => p.subcategory)),
    [products],
  );
  const primaryTypes = useMemo(
    () => uniqueSorted(products.map((p) => p.primaryType)),
    [products],
  );
  const powerTypes = useMemo(() => uniqueSorted(products.map((p) => p.powerType)), [products]);

  const filtered = useMemo(() => {
    const result = products.filter((p) => {
      if (condition.size > 0 && !(p.condition && condition.has(p.condition))) return false;
      if (inStockOnly && !p.inStock) return false;
      if (country.size > 0 && !(p.country && country.has(p.country))) return false;
      if (category.size > 0 && !(p.category && category.has(p.category))) return false;
      if (subcategory.size > 0 && !(p.subcategory && subcategory.has(p.subcategory)))
        return false;
      if (primaryType.size > 0 && !(p.primaryType && primaryType.has(p.primaryType)))
        return false;
      if (powerType.size > 0 && !(p.powerType && powerType.has(p.powerType))) return false;
      return true;
    });

    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sort) {
        case "capacity-desc":
          return (b.maxLiftingCapacity ?? -Infinity) - (a.maxLiftingCapacity ?? -Infinity);
        case "capacity-asc":
          return (a.maxLiftingCapacity ?? Infinity) - (b.maxLiftingCapacity ?? Infinity);
        case "height-desc":
          return (b.workingHeight ?? -Infinity) - (a.workingHeight ?? -Infinity);
        case "height-asc":
          return (a.workingHeight ?? Infinity) - (b.workingHeight ?? Infinity);
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return sorted;
  }, [products, condition, inStockOnly, country, category, subcategory, primaryType, powerType, sort]);

  const hasFilters =
    condition.size > 0 ||
    inStockOnly ||
    country.size > 0 ||
    category.size > 0 ||
    subcategory.size > 0 ||
    primaryType.size > 0 ||
    powerType.size > 0;

  function resetAll() {
    setCondition(new Set());
    setInStockOnly(false);
    setCountry(new Set());
    setCategory(new Set());
    setSubcategory(new Set());
    setPrimaryType(new Set());
    setPowerType(new Set());
  }

  const heading = subcategory.size === 1 ? Array.from(subcategory)[0] : "All Products";

  function toggleCompare(id: number) {
    setCompared((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="default-margin flex flex-col gap-8 py-8 lg:flex-row lg:items-start">
      <aside className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wide text-black/70 uppercase">Filters</p>
          <button
            type="button"
            onClick={resetAll}
            disabled={!hasFilters}
            className="text-sm font-semibold text-black underline underline-offset-2 disabled:cursor-not-allowed disabled:text-black/30"
          >
            Reset All
          </button>
        </div>

        {conditions.length > 0 && (
          <CheckboxGroup
            title="Product Condition"
            options={conditions}
            selected={condition}
            onToggle={(v) => setCondition((prev) => toggle(prev, v))}
          />
        )}

        <div className="border border-black/10 bg-white p-4">
          <p className="mb-3 text-xs font-bold tracking-wide text-black/70 uppercase">
            Product Availability
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-black/80">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 accent-primary-yellow"
            />
            InStock
          </label>
        </div>

        <CheckboxGroup
          title="Country"
          options={countries}
          selected={country}
          onToggle={(v) => setCountry((prev) => toggle(prev, v))}
        />
        <CheckboxGroup
          title="Category"
          options={categories}
          selected={category}
          onToggle={(v) => setCategory((prev) => toggle(prev, v))}
        />
        <CheckboxGroup
          title="Subcategory"
          options={subcategories}
          selected={subcategory}
          onToggle={(v) => setSubcategory((prev) => toggle(prev, v))}
        />
        <CheckboxGroup
          title="Primary Type"
          options={primaryTypes}
          selected={primaryType}
          onToggle={(v) => setPrimaryType((prev) => toggle(prev, v))}
        />
        <CheckboxGroup
          title="Power Type"
          options={powerTypes}
          selected={powerType}
          onToggle={(v) => setPowerType((prev) => toggle(prev, v))}
        />
      </aside>

      <main className="flex-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="uppercase">{heading}</h1>
            <p className="mt-2">
              Browse our full range of material handling and lifting equipment. Use the
              filters to find the right machine for your job site.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <p className="text-sm text-black/70">
              Showing <span className="font-semibold text-black">{filtered.length}</span> of{" "}
              <span className="font-semibold text-black">{products.length}</span> Products
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-black/30 bg-white px-4 py-2 text-sm text-black/80 focus:border-primary-yellow focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6">
          {filtered.length === 0 ? (
            <p className="text-black/60">No products match the selected filters.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-6 bg-black/[0.03] p-6 sm:flex-row sm:items-center"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden bg-white sm:w-40">
                  {product.imageUrl && (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt}
                      fill
                      className="object-contain"
                      sizes="160px"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-bold uppercase">{product.title}</p>
                  <dl className="mt-3 flex flex-col">
                    {product.modelNo && (
                      <div className="flex items-center justify-between gap-4 border-b border-black/10 py-2">
                        <dt className="text-sm text-black/60">Model No</dt>
                        <dd className="text-sm font-semibold text-black">{product.modelNo}</dd>
                      </div>
                    )}
                    {product.workingHeight != null && (
                      <div className="flex items-center justify-between gap-4 border-b border-black/10 py-2">
                        <dt className="text-sm text-black/60">Working Height</dt>
                        <dd className="text-sm font-semibold text-black">
                          {product.workingHeight}
                        </dd>
                      </div>
                    )}
                    {product.maxLiftingCapacity != null && (
                      <div className="flex items-center justify-between gap-4 py-2">
                        <dt className="text-sm text-black/60">Max Lifting Capacity</dt>
                        <dd className="text-sm font-semibold text-black">
                          {product.maxLiftingCapacity}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-end">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-black/70">
                    <input
                      type="checkbox"
                      checked={compared.has(product.id)}
                      onChange={() => toggleCompare(product.id)}
                      className="h-4 w-4 accent-primary-yellow"
                    />
                    Add to compare
                  </label>
                  <Link
                    href={`/products/${product.slug}`}
                    className="bg-primary-yellow px-6 py-2 text-center text-sm font-bold uppercase"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

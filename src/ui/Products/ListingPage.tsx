import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  categories,
  facetNames,
  getListing,
  hasListing,
  listingHref,
  summarize,
  type FacetKey,
  type Mode,
} from "@/content/products";
import { Breadcrumbs } from "@/ui/PageChrome";
import ListingView, { type FacetGroup, type NavOption } from "./ListingView";

export type ListingParams = { params: Promise<{ category: string; subcategory: string }> };

const GROUPS: { key: FacetKey; title: string; showAll?: boolean }[] = [
  { key: "condition", title: "Product Condition", showAll: true },
  { key: "country", title: "Country", showAll: true },
  { key: "primaryType", title: "Primary Type" },
  { key: "powerType", title: "Power Type", showAll: true },
  { key: "application", title: "Application", showAll: true },
  { key: "industry", title: "Industries", showAll: true },
  { key: "brand", title: "Brands" },
];

const label = (mode: Mode) => (mode === "buy" ? "Buy" : "Rent");

export async function listingMetadata(mode: Mode, { params }: ListingParams): Promise<Metadata> {
  const { category, subcategory } = await params;
  const l = getListing(mode, category, subcategory);
  if (!l) return {};
  return {
    title: { absolute: l.meta.title || `${l.title} for ${mode === "buy" ? "Sale" : "Rent"} | Mtandt` },
    description: l.meta.description || l.description || undefined,
    keywords: l.meta.keywords,
    alternates: { canonical: listingHref(mode, category, subcategory) },
  };
}

export default async function ListingPage({ mode, params }: ListingParams & { mode: Mode }) {
  const { category, subcategory } = await params;
  const l = getListing(mode, category, subcategory);
  if (!l) notFound();
  const other: Mode = mode === "buy" ? "rental" : "buy";

  const categoryNav: NavOption[] = categories.map((c) => {
    const first = c.subcategories.find((s) => hasListing(mode, c.slug, s.slug));
    return {
      label: c.crumb || c.title,
      href: listingHref(mode, c.slug, (first ?? c.subcategories[0]).slug),
      active: c.slug === category,
      disabled: !first && c.slug !== category,
    };
  });
  const subcategoryNav: NavOption[] = l.category.subcategories.map((s) => ({
    label: s.name,
    href: listingHref(mode, category, s.slug),
    active: s.slug === subcategory,
  }));
  const products = l.products.map(summarize);
  const groups: FacetGroup[] = GROUPS.filter(
    (g) => g.showAll || products.some((p) => p.facets[g.key]?.length),
  ).map((g) => ({
    ...g,
    options: Object.entries(facetNames[g.key] ?? {}).map(([id, name]) => ({ id, label: name })),
  }));

  return (
    <div className="default-margin pb-16">
      <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
        <Breadcrumbs
          items={[
            { label: label(mode) },
            { label: l.category.crumb || l.category.title, href: `/category-by-subcategory/${category}` },
            { label: l.title },
          ]}
        />
        <Link href={listingHref(other, category, subcategory)} className="btn-yellow self-start text-xs no-underline shadow-sm sm:mt-2">
          Browse for {label(other)}
        </Link>
      </div>
      <ListingView
        key={`${mode}/${category}/${subcategory}`}
        title={l.title}
        description={l.description}
        products={products}
        groups={groups}
        categoryNav={categoryNav}
        subcategoryNav={subcategoryNav}
        sorts={l.sorts}
      />
    </div>
  );
}

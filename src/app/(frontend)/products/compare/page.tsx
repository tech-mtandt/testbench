import type { Metadata } from "next";
import { getItem, getItemByLegacySlug, productHref, type CatalogItem } from "@/content/catalog";
import { categoryLabel, fmtSpec, specKey, type SearchParams } from "@/content/catalog-view";
import PageHero from "@/ui/kit/PageHero";
import CompareView, { type CompareColumn, type CompareRow } from "@/ui/Catalog/CompareView";

export const metadata: Metadata = {
  title: "Compare equipment",
  description: "Compare up to four machines side by side — working height, capacity, power and more.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/products/compare" },
};

type Props = { searchParams: Promise<SearchParams> };

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  // ?items= (new) or ?p= (legacy compare links used old product slugs)
  const raw = [sp.items, sp.p].flat().filter(Boolean).join(",");
  const items = [
    ...new Map(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => getItem(s) ?? getItemByLegacySlug(s))
        .filter((x): x is CatalogItem => !!x)
        .map((x) => [x.slug, x]),
    ).values(),
  ].slice(0, 4);

  const columns: CompareColumn[] = items.map((it) => ({
    slug: it.slug,
    href: productHref(it),
    title: it.title,
    model: it.model,
    image: it.image,
    photo: it.kind === "system",
    categoryName: it.subcategoryName || categoryLabel(it.category),
  }));

  // align specs by normalised label; keep first-seen order, model row dropped (it's in the header)
  const rows: CompareRow[] = [
    { label: "Available to", values: items.map((i) => i.modes.map((m) => (m === "buy" ? "Buy" : "Rent")).join(" · ")) },
    { label: "Category", values: items.map((i) => categoryLabel(i.category)) },
  ];
  const index = new Map<string, number>();
  items.forEach((it, col) => {
    for (const pair of it.specs) {
      const s = fmtSpec(pair);
      const k = specKey(pair[0]);
      if (!k || k === "modelno" || k === "model" || !s.value) continue;
      if (!index.has(k)) {
        index.set(k, rows.length);
        rows.push({ label: s.label, values: items.map(() => "") });
      }
      const row = rows[index.get(k)!];
      if (!row.values[col]) row.values[col] = s.value;
    }
  });

  const same = items.length > 0 && items.every((i) => i.category === items[0].category);
  const addHref = same ? `/products/${items[0].category}` : "/products";

  return (
    <>
      <PageHero
        crumbs={[{ label: "Equipment", href: "/products" }, { label: "Compare" }]}
        eyebrow="Compare"
        title="Side by side."
        description="Line up to four machines spec by spec. Toggle highlighting to see only what's different."
      />
      <section className="pb-24">
        <div className="container-x">
          <CompareView columns={columns} rows={rows} addHref={addHref} />
        </div>
      </section>
    </>
  );
}

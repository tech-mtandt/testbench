import { catalog, catalogCategories, categoryHref, categoryShort, productHref } from "@/content/catalog";
import { events, pressItems } from "@/content/media";
import { servicesIndex } from "@/content/services";
import { industryIndex } from "@/content/custom";
import { payloadClient } from "@/lib/payload";

export type SearchEntry = {
  /** group shown in the palette */
  g: "Equipment" | "Categories" | "Services" | "Articles" | "Events" | "Press" | "Pages" | "Industries";
  t: string;
  /** secondary line */
  s?: string;
  h: string;
  i?: string | null;
  /** extra searchable text (model numbers, category names) */
  k?: string;
};

const pages: SearchEntry[] = [
  { g: "Pages", t: "About Mtandt", s: "Since 1974 — who we are", h: "/about-us" },
  { g: "Pages", t: "Contact & offices", s: "Phone, email, 11 offices", h: "/contact-us" },
  { g: "Pages", t: "Careers", s: "Open roles", h: "/career" },
  { g: "Pages", t: "Become a partner", s: "Dealer, vendor, customer credit", h: "/partners" },
  { g: "Pages", t: "Catalogues & brochures", s: "Download PDFs", h: "/catalogues" },
  { g: "Pages", t: "Investor relations", s: "Annual returns, CSR", h: "/about-us#investors" },
  { g: "Pages", t: "Compare equipment", s: "Side-by-side specs", h: "/products/compare" },
  { g: "Pages", t: "Rent equipment", s: "Everything available for rent", h: "/products?mode=rent" },
];

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const out: SearchEntry[] = [...pages];
  for (const c of catalogCategories)
    out.push({ g: "Categories", t: categoryShort[c.slug] ?? c.title, s: `${c.subcategories.length} product lines`, h: categoryHref(c.slug), k: c.subcategories.map((s) => s.name).join(" ") });
  for (const it of catalog)
    out.push({
      g: "Equipment",
      t: it.title,
      s: [it.model, it.subcategoryName, it.modes.map((m) => (m === "buy" ? "Buy" : "Rent")).join(" · ")].filter(Boolean).join(" · "),
      h: productHref(it),
      i: it.image,
      k: `${it.model} ${it.categoryName} ${it.keySpecs.map((s) => s.join(" ")).join(" ")}`,
    });
  for (const s of servicesIndex.items.filter((x) => x.slug !== "fall-protection-training")) out.push({ g: "Services", t: s.title, s: s.excerpt.slice(0, 90), h: `/services/${s.slug}`, i: s.image });
  for (const ind of industryIndex.filter((x) => !/industries name/i.test(x.title))) out.push({ g: "Industries", t: ind.title, h: ind.href });
  for (const e of events) out.push({ g: "Events", t: e.title, s: e.location ?? undefined, h: `/event/${e.slug}`, i: e.thumb ?? e.image });
  for (const p of pressItems) out.push({ g: "Press", t: p.title, h: `/press/${p.slug}`, i: p.image });
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "blogs",
      where: { _status: { equals: "published" } },
      sort: "-publishedDate",
      limit: 200,
      depth: 0,
      select: { title: true, slug: true, category: true },
    });
    for (const b of docs) out.push({ g: "Articles", t: b.title, s: b.category ?? undefined, h: `/blogs/${b.slug}` });
  } catch (err) {
    console.error("[search-index] blogs unavailable", err);
  }
  return out;
}

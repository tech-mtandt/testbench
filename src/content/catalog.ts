/**
 * Unified equipment catalog: one entry per machine/system, regardless of how the legacy
 * site split it (separate buy + "-rent" listings, "custom product" landing pages).
 *
 * Source data is unchanged (scraped JSON behind products.ts / custom.ts); this module
 * only merges and re-shapes it. Canonical URLs:
 *   /products                              catalog (filters via ?category ?sub ?mode ?q)
 *   /products/[category]                   category page (?sub ?mode)
 *   /products/[category]/[slug]            product detail
 * `legacyPath()` maps every old URL shape onto these.
 */
import home from "@/content/scraped/home.json";
import customData from "@/content/scraped/custom-products.json";
import { allProducts, categories, getCategory, type Category, type FacetKey, type Product } from "@/content/products";
import type { CustomProduct } from "@/content/custom";

export type Mode = "buy" | "rent";
export type Kind = "equipment" | "system";

export type CatalogItem = {
  slug: string;
  kind: Kind;
  title: string;
  model: string;
  category: string;
  categoryName: string;
  subcategory: string | null;
  subcategoryName: string;
  modes: Mode[];
  image: string | null;
  gallery: string[];
  summary: string;
  descriptionHtml: string;
  specs: [string, string][];
  featuresHtml: string;
  optionsHtml: string;
  benefitsHtml: string;
  applications: string[];
  downloads: { label: string; href: string }[];
  charts: string[];
  journey: { title: string; html: string }[];
  showcase: CustomProduct["gallery"];
  clients: string[];
  related: string[];
  facets: Partial<Record<FacetKey, string[]>>;
  /** numeric specs for sorting/filtering, e.g. workingHeight */
  num: Partial<Record<string, number>>;
  /** 2–3 headline specs for cards */
  keySpecs: [string, string][];
  meta: { title?: string | null; description?: string | null; keywords?: string | null };
  /** old slugs that should redirect here */
  legacySlugs: string[];
};

const stripHtml = (h: string) =>
  h
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const excerpt = (h: string, n = 180) => {
  const t = stripHtml(h);
  return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
};
/**
 * Legacy titles are often ALL CAPS ("SELF PROPELLED DIESEL- DINGLI -JCPT1218RT").
 * Title-case them for display; keep model codes / short acronyms as-is.
 */
export function displayTitle(t: string) {
  const letters = t.replace(/[^A-Za-z]/g, "");
  if (!letters || letters.replace(/[^A-Z]/g, "").length / letters.length < 0.7) return t.replace(/\s+-\s*|\s*-\s+/g, " – ").trim();
  return t
    .replace(/\s+-\s*|\s*-\s+/g, " – ")
    .split(/(\s+)/)
    .map((w) => (/\d/.test(w) || (w.length <= 3 && /^[A-Z]+$/.test(w) && !/^(AND|THE|FOR|MTR)$/.test(w)) ? w : w.charAt(0) + w.slice(1).toLowerCase()))
    .join("")
    .replace(/Mtr/g, "m")
    .trim();
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const baseSlug = (s: string) => s.replace(/^rental-/, "").replace(/-(rent|rental)(-\d+)?$/, "").replace(/-rent-(\d+)$/, "-$1");

const KEY_SPEC = /working height|platform height|capacity|swl|load|reach|model|power|size|dimension/i;

function fromStandard(buy: Product | undefined, rent: Product | undefined): CatalogItem {
  const p = (buy ?? rent)!;
  const keySpecs = (p.row.length ? p.row : p.specs).filter(([k]) => KEY_SPEC.test(k) && !/model/i.test(k)).slice(0, 3);
  return {
    slug: baseSlug(p.slug).replace(/^buy-/, ""),
    kind: "equipment",
    title: displayTitle(p.title),
    model: p.model,
    category: p.category!,
    categoryName: p.categoryName,
    subcategory: p.subcategory,
    subcategoryName: p.subcategoryName,
    modes: [...(buy ? (["buy"] as const) : []), ...(rent ? (["rent"] as const) : [])],
    image: p.image,
    gallery: p.gallery.length ? p.gallery : p.image ? [p.image] : [],
    summary: excerpt(p.descriptionHtml),
    descriptionHtml: p.descriptionHtml,
    specs: p.specs,
    featuresHtml: p.featuresHtml,
    optionsHtml: p.optionsHtml,
    benefitsHtml: "",
    applications: p.applications,
    downloads: p.download ? [{ label: "Product brochure", href: p.download }] : [],
    charts: p.charts,
    journey: [],
    showcase: null,
    clients: [],
    related: p.related.map(baseSlug),
    facets: p.facets,
    num: p.num,
    keySpecs,
    meta: p.meta,
    legacySlugs: [buy?.slug, rent?.slug].filter((s): s is string => !!s),
  };
}

// Card imagery for systems: the homepage product tabs have clean product shots.
const homeImages = new Map<string, string>();
for (const tab of home.productTabs) for (const it of tab.items) if (it.href && it.image) homeImages.set(it.href.split("/").pop()!, it.image);

function fromCustom(slug: string, c: CustomProduct, rentable: boolean): CatalogItem {
  const cat = getCategory(c.category);
  const sub = cat?.subcategories.find((s) => s.slug === slug);
  const images = [homeImages.get(slug), c.hero, ...(c.gallery?.items.map((g) => g.image) ?? [])].filter((x): x is string => !!x);
  return {
    slug,
    kind: "system",
    title: c.title,
    model: "",
    category: c.category,
    categoryName: cat?.title ?? c.category,
    subcategory: sub ? slug : null,
    subcategoryName: sub?.name ?? c.title,
    modes: rentable ? ["buy", "rent"] : ["buy"],
    image: images[0] ?? null,
    gallery: [...new Set(images)].slice(0, 12),
    summary: excerpt(c.intro),
    descriptionHtml: c.intro,
    specs: c.specs.filter((r) => r.length >= 2).map((r) => [r[0], r.slice(1).join(" ")] as [string, string]),
    featuresHtml: c.features,
    optionsHtml: "",
    benefitsHtml: c.benefits,
    applications: [],
    downloads: c.download ? [{ label: "Product brochure", href: c.download }] : [],
    charts: [],
    journey: c.journey,
    showcase: c.gallery,
    clients: c.clients,
    related: c.related.map((r) => r.href.split("/").pop()!).filter(Boolean),
    facets: {},
    num: {},
    keySpecs: c.specs.filter((r) => r.length >= 2).slice(0, 2).map((r) => [r[0], r.slice(1).join(" ")] as [string, string]),
    meta: c.meta,
    legacySlugs: [slug],
  };
}

function build() {
  const std = allProducts();
  const buys = std.filter((p) => p.mode === "buy");
  const rents = std.filter((p) => p.mode === "rent");
  const buyBySlug = new Map(buys.map((p) => [p.slug, p]));
  const buyByTitle = new Map(buys.map((p) => [`${norm(p.title)}|${p.subcategory}`, p]));
  const pairs = new Map<string, { buy?: Product; rent?: Product }>(buys.map((p) => [p.slug, { buy: p }]));
  for (const r of rents) {
    const match = buyBySlug.get(baseSlug(r.slug)) ?? buyByTitle.get(`${norm(r.title)}|${r.subcategory}`);
    const pair = match && pairs.get(match.slug);
    if (pair && !pair.rent) pair.rent = r;
    else pairs.set(`rent:${r.slug}`, { rent: r });
  }
  const items: CatalogItem[] = [...pairs.values()].map(({ buy, rent }) => fromStandard(buy, rent));

  const custom = customData as unknown as { buy: Record<string, CustomProduct>; rental: Record<string, CustomProduct> };
  for (const [slug, c] of Object.entries(custom.buy)) items.push(fromCustom(slug, c, slug in custom.rental));

  // de-duplicate canonical slugs (rent-only items whose base slug is taken)
  const seen = new Set<string>();
  for (const it of items) {
    if (seen.has(it.slug)) it.slug = it.legacySlugs[it.legacySlugs.length - 1];
    seen.add(it.slug);
  }
  return items;
}

const items = build();
const bySlug = new Map(items.map((i) => [i.slug, i]));
const byLegacy = new Map(items.flatMap((i) => i.legacySlugs.map((s) => [s, i] as const)));

export const catalog = items;
export const catalogCategories: Category[] = categories;
export const getItem = (slug: string) => bySlug.get(slug) ?? null;
export const getItemByLegacySlug = (slug: string) => byLegacy.get(slug) ?? bySlug.get(slug) ?? null;
export const itemsInCategory = (cat: string) => items.filter((i) => i.category === cat);
export const relatedItems = (it: CatalogItem, n = 8) => {
  const rel = [...new Set(it.related.map((s) => bySlug.get(s) ?? byLegacy.get(s)))].filter((x): x is CatalogItem => !!x && x.slug !== it.slug);
  const more = items.filter((x) => x.slug !== it.slug && x.subcategory === it.subcategory && !rel.includes(x));
  return [...rel, ...more].slice(0, n);
};

// ----------------------------------------------------------------- URLs
export const productHref = (it: Pick<CatalogItem, "category" | "slug">) => `/products/${it.category}/${it.slug}`;
export const categoryHref = (cat: string, opts: { sub?: string | null; mode?: Mode | null } = {}) => {
  const q = new URLSearchParams();
  if (opts.sub) q.set("sub", opts.sub);
  if (opts.mode) q.set("mode", opts.mode);
  const s = q.toString();
  return `/products/${cat}${s ? `?${s}` : ""}`;
};

/** Category imagery for tiles/menus: first product image in the category. */
export const categoryImage = (cat: string) => items.find((i) => i.category === cat && i.image)?.image ?? null;
export const categoryCount = (cat: string) => items.filter((i) => i.category === cat).length;

/** Short marketing names for the 8 categories (menus, tiles). */
export const categoryShort: Record<string, string> = {
  "aerial-work-platform": "Aerial Work Platforms",
  "material-handling-equipment": "Material Handling",
  "aluminium-scaffold": "Aluminium Scaffolding",
  mlit: "Light & Power Towers",
  "temporary-road-mats": "Temporary Road Mats",
  "fall-protection-lifeline-systems": "Fall Protection Systems",
  "web-systems-international": "Under-Deck & Net Systems",
  "tools-and-supplies": "Tools & Supplies",
};

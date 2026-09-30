import { cache } from "react";
import type { CollectionSlug, PopulateType, SelectType, Where } from "payload";
import taxonomy from "@/content/scraped/product-categories.json";
import productsJson from "@/content/scraped/products.json";
import { cached, fileUrl, html, str } from "@/cms/read";
import { payloadClient } from "@/lib/payload";
import type {
  Product as ProductDoc,
  ProductAttribute as AttributeDoc,
  ProductCategory as CategoryDoc,
  ProductListing as ListingDoc,
} from "@/payload-types";

/**
 * The standard-equipment catalogue: categories, listings, filter values and products.
 * Read from Payload (`product-categories`, `product-listings`, `product-attributes`,
 * `products` with a `mode`), mapped back into the shape of the scraped JSON
 * (migration/scrape/extract_products.py), which stays the fallback until the content is
 * imported or when the database is unreachable.
 *
 * Caching: the taxonomy and a light product index (no description/feature HTML) are
 * cached as two entries; full product pages are cached per slug.
 */

export type Mode = "buy" | "rental";
export type Meta = { title?: string; description?: string; keywords?: string; image?: string | null };
export type Faq = { q: string; a: string };
export type Subcategory = {
  slug: string;
  name: string;
  html: string;
  button: { label: string; href?: string; choose?: boolean } | null;
  faqs: Faq[];
};
export type Category = {
  slug: string;
  title: string;
  intro: string;
  crumb: string;
  meta: Meta;
  subcategories: Subcategory[];
};
export type SortOption = { label: string; field: string; dir: string };
export type FacetKey = "condition" | "country" | "primaryType" | "powerType" | "application" | "industry" | "brand";
export type Product = {
  slug: string;
  legacyId: number | null;
  dbId: number | null;
  title: string;
  model: string;
  mode: "buy" | "rent";
  category: string | null;
  subcategory: string | null;
  categoryName: string;
  subcategoryName: string;
  image: string | null;
  gallery: string[];
  descriptionHtml: string;
  specs: [string, string][];
  featuresHtml: string;
  optionsHtml: string;
  applications: string[];
  download: string | null;
  charts: string[];
  related: string[];
  meta: Meta;
  row: [string, string][];
  facets: Partial<Record<FacetKey, string[]>>;
  num: Partial<Record<string, number>>;
};

/** A product as held in the catalogue index: no page-only HTML, plus plain text for search. */
export type CatalogProduct = Omit<
  Product,
  "descriptionHtml" | "featuresHtml" | "optionsHtml" | "gallery" | "applications" | "download" | "charts" | "meta"
> & { text: string };

/** What a listing row / card needs on the client. */
export type ProductSummary = Pick<
  Product,
  "slug" | "title" | "model" | "image" | "row" | "facets" | "num" | "mode" | "categoryName" | "subcategoryName"
>;

export type Listing = {
  mode: Mode;
  category: Category;
  subcategory: Subcategory;
  title: string;
  description: string;
  columns: string[];
  sorts: SortOption[];
  meta: Meta;
  products: CatalogProduct[];
};

type RawListing = Omit<Listing, "mode" | "category" | "subcategory" | "products"> & { products: string[] };

type Taxonomy = {
  categories: Category[];
  aliases: Record<string, string>;
  listings: Record<string, RawListing>;
  facets: Record<FacetKey, Record<string, string>>;
};

export type Catalog = Taxonomy & {
  products: CatalogProduct[];
  bySlug: Map<string, CatalogProduct>;
};

const FACETS: FacetKey[] = ["condition", "country", "primaryType", "powerType", "application", "industry", "brand"];

// ---------- scraped JSON (fallback) ----------

const json = taxonomy as unknown as Taxonomy;
const jsonProducts = productsJson as unknown as Product[];
const jsonBySlug = new Map(jsonProducts.map((p) => [p.slug, p]));

const strip = (h: string) => h.replace(/<[^>]+>/g, " ");

function toEntry(p: Product): CatalogProduct {
  const {
    descriptionHtml,
    featuresHtml: _f,
    optionsHtml: _o,
    gallery: _g,
    applications: _a,
    download: _d,
    charts: _c,
    meta: _m,
    ...rest
  } = p;
  return { ...rest, text: strip(descriptionHtml) };
}

// ---------- CMS -> JSON shape ----------

async function find<T>(
  collection: CollectionSlug,
  args: { where?: Where; sort?: string | string[]; depth?: number; select?: SelectType; populate?: PopulateType },
): Promise<T[] | null> {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({ collection, limit: 0, pagination: false, depth: 1, ...args });
    return docs.length ? (docs as T[]) : null;
  } catch (err) {
    console.error(`[cms] collection "${collection}" read failed`, err);
    return null;
  }
}

const obj = <T>(v: number | T | null | undefined): T | null => (v && typeof v === "object" ? v : null);
const text = (v: unknown) => str(v) ?? undefined;
const facetId = (a: Pick<AttributeDoc, "id" | "legacyId">) => a.legacyId || `cms-${a.id}`;

// Populated relations only need a few fields.
const POPULATE = {
  "product-categories": { slug: true, title: true, subcategories: { slug: true, name: true } },
  "product-attributes": { legacyId: true },
  products: { slug: true },
} as PopulateType;

function mapProduct(d: ProductDoc): Product {
  const cat = obj(d.productCategory);
  const num: Partial<Record<string, number>> = {};
  const nums: [string, number | null | undefined][] = [
    ["working_height", d.workingHeight],
    ["machine_weight", d.machineWeight],
    ["mhe_maxliftingcapacity", d.maxLiftingCapacity],
    ["mhe_maxliftingheight", d.maxLiftingHeight],
  ];
  for (const [k, v] of nums) if (typeof v === "number") num[k] = v;
  const facets: Partial<Record<FacetKey, string[]>> = {};
  for (const key of FACETS) {
    const ids = (d.facets?.[key] ?? []).map((a) => obj(a)).flatMap((a) => (a ? [facetId(a)] : []));
    if (ids.length) facets[key] = ids;
  }
  const charts = (d.charts ?? []).map((c) => fileUrl(c.image)).filter((x): x is string => !!x);
  const chart = fileUrl(d.chartImage);
  return {
    slug: d.slug,
    legacyId: d.legacyId ?? null,
    dbId: d.id,
    title: d.title,
    model: d.modelNo ?? "",
    mode: d.mode === "rent" ? "rent" : "buy",
    category: cat?.slug ?? null,
    subcategory: d.subcategory ?? null,
    categoryName: cat?.title ?? "",
    subcategoryName: cat?.subcategories?.find((s) => s.slug === d.subcategory)?.name ?? "",
    image: fileUrl(d.featuredImage),
    gallery: (d.gallery ?? []).map((g) => fileUrl(g.image)).filter((x): x is string => !!x),
    descriptionHtml: html(d.content),
    specs: (d.specifications ?? []).map((s) => [s.label, s.value]),
    featuresHtml: html(d.features),
    optionsHtml: html(d.optionsContent),
    applications: (d.applications ?? []).map((a) => a.application),
    download: fileUrl(d.downloads?.[0]?.file),
    charts: charts.length || !chart ? charts : [chart],
    related: (d.related ?? []).flatMap((r) => (obj(r)?.slug ? [obj(r)!.slug] : [])),
    meta: {
      title: text(d.meta?.title),
      description: text(d.meta?.description),
      keywords: text(d.metaKeywords),
      image: fileUrl(d.meta?.image),
    },
    row: (d.listingRow ?? []).map((r) => [r.label, r.value]),
    facets,
    num,
  };
}

function mapCategory(d: CategoryDoc): Category {
  return {
    slug: d.slug,
    title: d.title,
    intro: d.intro ?? "",
    crumb: d.crumb ?? "",
    meta: {
      title: text(d.meta?.title),
      description: text(d.meta?.description),
      // Empty string (not undefined) keeps today's empty keywords tag.
      keywords: d.metaKeywords ?? "",
      image: fileUrl(d.meta?.image),
    },
    subcategories: (d.subcategories ?? []).map((s) => ({
      slug: s.slug,
      name: s.name,
      html: html(s.html),
      button: s.button?.label
        ? {
            label: s.button.label,
            ...(str(s.button.href) ? { href: s.button.href! } : {}),
            ...(s.button.choose ? { choose: true } : {}),
          }
        : null,
      faqs: (s.faqs ?? []).map((f) => ({ q: f.q, a: html(f.a) })),
    })),
  };
}

function mapListing(d: ListingDoc): [string, RawListing] | null {
  const cat = obj(d.productCategory);
  if (!cat) return null;
  return [
    `${d.mode}/${cat.slug}/${d.subcategory}`,
    {
      title: d.title,
      description: d.description ?? "",
      columns: d.columns ?? [],
      sorts: (d.sorts ?? []).map((s) => ({ label: s.label, field: s.field, dir: s.dir })),
      meta: {
        title: text(d.meta?.title),
        description: text(d.meta?.description),
        keywords: text(d.metaKeywords),
        image: fileUrl(d.meta?.image),
      },
      products: (d.products ?? []).flatMap((p) => (obj(p)?.slug ? [obj(p)!.slug] : [])),
    },
  ];
}

// ---------- cached reads ----------

const readTaxonomy = cached(async (): Promise<Taxonomy> => {
  const [cats, attrs, lists] = await Promise.all([
    find<CategoryDoc>("product-categories", { depth: 0, sort: ["order", "id"] }),
    find<AttributeDoc>("product-attributes", { depth: 0, sort: "id" }),
    find<ListingDoc>("product-listings", {
      depth: 1,
      populate: { "product-categories": { slug: true }, products: { slug: true } } as PopulateType,
    }),
  ]);

  let categories = json.categories;
  let aliases = json.aliases;
  if (cats) {
    categories = cats.map(mapCategory);
    aliases = {};
    for (const c of cats) {
      aliases[c.slug] = c.slug;
      for (const a of c.aliases ?? []) aliases[a] = c.slug;
    }
  }

  let facets = json.facets;
  if (attrs) {
    facets = Object.fromEntries(FACETS.map((k) => [k, {}])) as Taxonomy["facets"];
    for (const a of attrs) facets[a.type][facetId(a)] = a.label;
  }

  const listings = lists
    ? Object.fromEntries(lists.map(mapListing).filter((x): x is [string, RawListing] => !!x))
    : json.listings;

  return { categories, aliases, listings, facets };
}, "products:taxonomy");

const readIndex = cached(async (): Promise<{ products: CatalogProduct[]; cms: boolean }> => {
  const docs = await find<ProductDoc>("products", {
    where: { mode: { exists: true } },
    sort: ["order", "id"],
    // Page-only content stays out of the index (see readProduct).
    select: {
      features: false,
      optionsContent: false,
      gallery: false,
      charts: false,
      downloads: false,
      applications: false,
      meta: false,
      standardFeatures: false,
      options: false,
    } as SelectType,
    populate: POPULATE,
  });
  if (!docs) return { products: jsonProducts.map(toEntry), cms: false };
  return { products: docs.map((d) => toEntry(mapProduct(d))), cms: true };
}, "products:index");

const readProduct = cached(async (slug: string): Promise<Product | null> => {
  const docs = await find<ProductDoc>("products", {
    where: { and: [{ slug: { equals: slug } }, { mode: { exists: true } }] },
    populate: POPULATE,
  });
  return docs ? mapProduct(docs[0]) : null;
}, "products:detail");

/** Taxonomy + product index, once per request. */
export const getCatalog = cache(async (): Promise<Catalog & { cms: boolean }> => {
  const [tax, idx] = await Promise.all([readTaxonomy(), readIndex()]);
  return { ...tax, ...idx, bySlug: new Map(idx.products.map((p) => [p.slug, p])) };
});

// ---------- helpers ----------

export const getCategories = async () => (await getCatalog()).categories;
export const getFacetNames = async () => (await getCatalog()).facets;

const findCategory = (c: Catalog, slug: string) => c.categories.find((x) => x.slug === slug) ?? null;

export const getCategory = async (slug: string) => findCategory(await getCatalog(), slug);

export async function categoryAlias(slug: string) {
  const c = await getCatalog();
  return c.aliases[slug] ?? (findCategory(c, slug) ? slug : null);
}

/** Full product (page content included). */
export async function getProduct(slug: string): Promise<Product | null> {
  const c = await getCatalog();
  if (!c.cms) return jsonBySlug.get(slug) ?? null;
  if (!c.bySlug.has(slug)) return null;
  // The index lists it, so a miss here is a failed read: fall back to the scraped copy.
  return (await readProduct(slug)) ?? jsonBySlug.get(slug) ?? null;
}

export const allProducts = async () => (await getCatalog()).products;

export const listingHref = (mode: Mode, cat: string, sub: string) => `/product-category-${mode}/${cat}/${sub}`;

export async function getListing(mode: Mode, cat: string, sub: string): Promise<Listing | null> {
  const c = await getCatalog();
  const category = findCategory(c, cat);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return null;
  const raw = c.listings[`${mode}/${cat}/${sub}`];
  return {
    mode,
    category,
    subcategory,
    title: raw?.title || subcategory.name,
    description: raw?.description ?? "",
    columns: raw?.columns ?? ["Model No", "Working Height", "Platform Height"],
    sorts: raw?.sorts ?? [],
    meta: raw?.meta ?? {},
    products: (raw?.products ?? []).map((s) => c.bySlug.get(s)!).filter(Boolean),
  };
}

export const listingParams = async () =>
  (await getCategories()).flatMap((c) => c.subcategories.map((s) => ({ category: c.slug, subcategory: s.slug })));

export const hasListing = (c: Catalog, mode: Mode, cat: string, sub: string) =>
  (c.listings[`${mode}/${cat}/${sub}`]?.products.length ?? 0) > 0;

export const summarize = (p: ProductSummary): ProductSummary => ({
  slug: p.slug,
  title: p.title,
  model: p.model,
  image: p.image,
  row: p.row,
  facets: p.facets,
  num: p.num,
  mode: p.mode,
  categoryName: p.categoryName,
  subcategoryName: p.subcategoryName,
});

export async function relatedProducts(p: Pick<Product, "slug" | "related" | "subcategory" | "mode">) {
  const { products, bySlug } = await getCatalog();
  const rel = p.related.map((s) => bySlug.get(s)).filter((x): x is CatalogProduct => !!x);
  if (rel.length) return rel;
  return products.filter((x) => x.slug !== p.slug && x.subcategory === p.subcategory && x.mode === p.mode).slice(0, 12);
}

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export type SearchResult = {
  products: CatalogProduct[];
  subcategories: { category: Category; subcategory: Subcategory; href: string }[];
};

const has = (hay: string, w: string) => hay.includes(w) || hay.replace(/ /g, "").includes(w);

/**
 * Title-first search: products containing every query word (title, model, category, specs,
 * description). If none match all words, falls back to the products matching the most words.
 */
export async function searchProducts(q: string): Promise<SearchResult> {
  const words = fold(q).split(" ").filter(Boolean);
  if (!words.length) return { products: [], subcategories: [] };
  const catalog = await getCatalog();
  const scored = catalog.products
    .map((p) => {
      const title = fold(`${p.title} ${p.model}`);
      const hay = fold(`${title} ${p.subcategoryName} ${p.categoryName} ${p.specs.map((s) => s[1]).join(" ")} ${p.text}`);
      const hits = words.filter((w) => has(hay, w)).length;
      const score = words.filter((w) => has(title, w)).length * 2 + (title.includes(words.join(" ")) ? 3 : 0);
      return { p, hits, score };
    })
    .filter((x) => x.hits > 0);
  const best = Math.max(0, ...scored.map((x) => x.hits));
  const need = best === words.length ? best : Math.max(2, best);
  const ranked = scored
    .filter((x) => x.hits >= need)
    .sort((a, b) => b.hits - a.hits || b.score - a.score || a.p.title.localeCompare(b.p.title));
  const subs = catalog.categories.flatMap((category) =>
    category.subcategories
      .filter((s) => words.every((w) => has(fold(`${s.name} ${category.title}`), w)))
      .map((subcategory) => ({
        category,
        subcategory,
        href:
          subcategory.button?.href ??
          (hasListing(catalog, "buy", category.slug, subcategory.slug)
            ? listingHref("buy", category.slug, subcategory.slug)
            : `/category-by-subcategory/${category.slug}`),
      })),
  );
  return { products: ranked.map((x) => x.p), subcategories: subs };
}

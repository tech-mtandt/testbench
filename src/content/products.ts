import taxonomy from "@/content/scraped/product-categories.json";
import productsJson from "@/content/scraped/products.json";

/**
 * Standard products scraped from www.mtandt.com (migration/scrape/extract_products.py).
 * TODO(migration): the Payload `products` collection only has title/slug/featuredImage/content;
 * category, specs and filter facets live here until the schema grows. `dbId` links a scraped
 * product to its Payload document where the slugs match.
 */

export type Mode = "buy" | "rental";
export type Meta = { title?: string; description?: string; keywords?: string };
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
export type Listing = {
  mode: Mode;
  category: Category;
  subcategory: Subcategory;
  title: string;
  description: string;
  columns: string[];
  sorts: SortOption[];
  meta: Meta;
  products: Product[];
};
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

/** What a listing row / card needs on the client. */
export type ProductSummary = Pick<
  Product,
  "slug" | "title" | "model" | "image" | "row" | "facets" | "num" | "mode" | "categoryName" | "subcategoryName"
>;

type RawListing = Omit<Listing, "mode" | "category" | "subcategory" | "products"> & { products: string[] };

const data = taxonomy as unknown as {
  categories: Category[];
  aliases: Record<string, string>;
  listings: Record<string, RawListing>;
  facets: Record<FacetKey, Record<string, string>>;
};
const products = productsJson as unknown as Product[];
const bySlug = new Map(products.map((p) => [p.slug, p]));

export const categories = data.categories;
export const facetNames = data.facets;

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug) ?? null;
export const categoryAlias = (slug: string) => data.aliases[slug] ?? (getCategory(slug) ? slug : null);
export const getProduct = (slug: string) => bySlug.get(slug) ?? null;
export const allProducts = () => products;

export const listingHref = (mode: Mode, cat: string, sub: string) => `/product-category-${mode}/${cat}/${sub}`;

export function getListing(mode: Mode, cat: string, sub: string): Listing | null {
  const category = getCategory(cat);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return null;
  const raw = data.listings[`${mode}/${cat}/${sub}`];
  return {
    mode,
    category,
    subcategory,
    title: raw?.title || subcategory.name,
    description: raw?.description ?? "",
    columns: raw?.columns ?? ["Model No", "Working Height", "Platform Height"],
    sorts: raw?.sorts ?? [],
    meta: raw?.meta ?? {},
    products: (raw?.products ?? []).map((s) => bySlug.get(s)!).filter(Boolean),
  };
}

export const listingParams = () =>
  categories.flatMap((c) => c.subcategories.map((s) => ({ category: c.slug, subcategory: s.slug })));

export const hasListing = (mode: Mode, cat: string, sub: string) =>
  (data.listings[`${mode}/${cat}/${sub}`]?.products.length ?? 0) > 0;

export const summarize = (p: Product): ProductSummary => ({
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

export const relatedProducts = (p: Product) => {
  const rel = p.related.map((s) => bySlug.get(s)).filter((x): x is Product => !!x);
  if (rel.length) return rel;
  return products.filter((x) => x.slug !== p.slug && x.subcategory === p.subcategory && x.mode === p.mode).slice(0, 12);
};

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export type SearchResult = {
  products: Product[];
  subcategories: { category: Category; subcategory: Subcategory; href: string }[];
};

const has = (hay: string, w: string) => hay.includes(w) || hay.replace(/ /g, "").includes(w);
const strip = (html: string) => html.replace(/<[^>]+>/g, " ");

/**
 * Title-first search: products containing every query word (title, model, category, specs,
 * description). If none match all words, falls back to the products matching the most words.
 */
export function searchProducts(q: string): SearchResult {
  const words = fold(q).split(" ").filter(Boolean);
  if (!words.length) return { products: [], subcategories: [] };
  const scored = products
    .map((p) => {
      const title = fold(`${p.title} ${p.model}`);
      const hay = fold(
        `${title} ${p.subcategoryName} ${p.categoryName} ${p.specs.map((s) => s[1]).join(" ")} ${strip(p.descriptionHtml)}`,
      );
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
  const subs = categories.flatMap((category) =>
    category.subcategories
      .filter((s) => words.every((w) => has(fold(`${s.name} ${category.title}`), w)))
      .map((subcategory) => ({
        category,
        subcategory,
        href:
          subcategory.button?.href ??
          (hasListing("buy", category.slug, subcategory.slug)
            ? listingHref("buy", category.slug, subcategory.slug)
            : `/category-by-subcategory/${category.slug}`),
      })),
  );
  return { products: ranked.map((x) => x.p), subcategories: subs };
}

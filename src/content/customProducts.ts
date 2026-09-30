import customData from "@/content/scraped/custom-products.json";
import { cached, fileUrl, html, readAll, str } from "@/cms/read";
import type { CustomProduct as CustomProductDoc } from "@/payload-types";

/**
 * Engineered-solution pages (/custom-product-detail-<kind>/<category>/<slug>), read from the
 * `custom-products` collection and mapped to the scraped JSON shape; the JSON is the
 * fallback until they are imported.
 */

export type Kind = "buy" | "rental";

export type GalleryItem = { image: string; title: string; caption: string; filters: string[] };

export type CustomProduct = {
  title: string;
  productId: string | null;
  meta: { title?: string | null; description?: string | null; keywords?: string | null; image?: string | null };
  crumb: { label: string | null; href: string | null };
  hero: string | null;
  intro: string;
  specs: string[][];
  features: string;
  benefits: string;
  download: string | null;
  journey: { title: string; html: string }[];
  gallery: { filters: { id: string; label: string }[]; items: GalleryItem[] } | null;
  related: { title: string; href: string; image: string | null }[];
  clients: string[];
  category: string;
};

/** A custom product plus the legacy category segments that also serve it. */
type Stored = CustomProduct & { altCategories: string[] };
type Store = Record<Kind, Record<string, Stored>>;

const json = customData as unknown as Record<Kind, Record<string, CustomProduct>> & {
  aliases: Record<string, string>;
};

function fromJson(): Store {
  const withAliases = (p: CustomProduct): Stored => ({
    ...p,
    altCategories: Object.entries(json.aliases)
      .filter(([, to]) => to === p.category)
      .map(([from]) => from),
  });
  const map = (kind: Kind) =>
    Object.fromEntries(Object.entries(json[kind]).map(([slug, p]) => [slug, withAliases(p)]));
  return { buy: map("buy"), rental: map("rental") };
}

function mapDoc(d: CustomProductDoc): Stored {
  const filters = (d.gallery?.filters ?? []).map((f) => ({ id: f.filterId, label: f.label }));
  const items = (d.gallery?.items ?? []).flatMap((it) => {
    const image = fileUrl(it.image);
    return image ? [{ image, title: it.title ?? "", caption: it.caption ?? "", filters: it.filters ?? [] }] : [];
  });
  return {
    title: d.title,
    productId: str(d.productId),
    meta: {
      title: str(d.meta?.title),
      description: str(d.meta?.description),
      keywords: str(d.metaKeywords),
      image: fileUrl(d.meta?.image),
    },
    crumb: { label: str(d.crumb?.label), href: str(d.crumb?.href) },
    hero: fileUrl(d.hero),
    intro: html(d.intro),
    specs: (d.specs ?? []).map((s) => [s.label, s.value ?? ""]),
    features: html(d.features),
    benefits: html(d.benefits),
    download: fileUrl(d.download),
    journey: (d.journey ?? []).map((j) => ({ title: j.title, html: html(j.html) })),
    gallery: filters.length || items.length ? { filters, items } : null,
    related: (d.related ?? []).map((r) => ({ title: r.title, href: r.href, image: fileUrl(r.image) })),
    clients: (d.clients ?? []).map((c) => fileUrl(c.logo)).filter((x): x is string => !!x),
    category: d.category,
    altCategories: d.altCategories ?? [],
  };
}

const readStore = cached(async (): Promise<Store> => {
  const docs = await readAll<CustomProductDoc>("custom-products", { depth: 1, sort: "id" });
  if (!docs) return fromJson();
  const store: Store = { buy: {}, rental: {} };
  for (const d of docs) store[d.kind][d.slug] = mapDoc(d);
  return store;
}, "custom-products");

export async function getCustomProduct(kind: Kind, category: string, slug: string): Promise<CustomProduct | null> {
  const p = (await readStore())[kind][slug];
  if (!p) return null;
  return category === p.category || p.altCategories.includes(category) ? p : null;
}

export async function customProductParams(kind: Kind) {
  return Object.entries((await readStore())[kind]).flatMap(([slug, p]) => [
    { category: p.category, slug },
    ...p.altCategories.map((category) => ({ category, slug })),
  ]);
}

export function customProductPath(kind: Kind, p: CustomProduct, slug: string) {
  return `/custom-product-detail-${kind}/${p.category}/${slug}`;
}

/**
 * Canonical URLs for the standard-equipment catalogue. The path is the hierarchy:
 *
 *   /<category>                              category page
 *   /<category>/<subcategory>                range hub (landing page)
 *   /<category>/<subcategory>/buy|rent       listings
 *   /<category>/<subcategory>/<product>      product page
 *
 * The old-site addresses (/category-by-subcategory/…, /product-category-buy|rental/…,
 * /product-detail/…) permanently redirect here.
 */

export type ListingMode = "buy" | "rental";

export const categoryHref = (cat: string) => `/${cat}`;
export const subcategoryHref = (cat: string, sub: string) => `/${cat}/${sub}`;
export const listingHref = (mode: ListingMode, cat: string, sub: string) =>
  `/${cat}/${sub}/${mode === "buy" ? "buy" : "rent"}`;

export const productHref = (p: { slug: string; category?: string | null; subcategory?: string | null }) =>
  p.category && p.subcategory ? `/${p.category}/${p.subcategory}/${p.slug}` : `/product-detail/${p.slug}`;

/** Rewrites an old-site catalogue link (e.g. one saved in the CMS) to its current address. */
export function modernizeHref(href: string): string {
  let m = href.match(/^\/product-category-(buy|rental|rentel)\/([^/?#]+)\/([^/?#]+)\/?$/);
  if (m) return listingHref(m[1] === "buy" ? "buy" : "rental", m[2], m[3]);
  m = href.match(/^\/category-by-subcategory\/([^/?#]+)\/?$/);
  if (m) return categoryHref(m[1]);
  return href;
}

const OLD_LINK =
  /(?:https?:\/\/(?:www\.)?mtandt\.com)?\/(?:product-category-(buy|rental|rentel)\/([a-z0-9-]+)\/([a-z0-9-]+)|category-by-subcategory\/([a-z0-9-]+))(?=["'\s?#<]|\/?$|\/["'])/g;

/** Rewrites old catalogue links inside text/HTML (CMS content) to their current addresses. */
export const modernizeLinks = (text: string) =>
  text.replace(OLD_LINK, (_m, mode, cat, sub, catOnly) =>
    catOnly ? categoryHref(catOnly) : listingHref(mode === "buy" ? "buy" : "rental", cat, sub),
  );

/** Applies `modernizeLinks` to every string in a plain JSON-like value. */
export function modernizeDeep<T>(value: T): T {
  if (typeof value === "string") return modernizeLinks(value) as T;
  if (Array.isArray(value)) return value.map(modernizeDeep) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, modernizeDeep(v)])) as T;
  return value;
}

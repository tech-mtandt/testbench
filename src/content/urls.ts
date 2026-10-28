/**
 * Canonical URLs for the standard-equipment catalogue. The path is the hierarchy:
 *
 *   /<category>                              category landing page
 *   /<category>/<subcategory>                range landing page
 *   /<category>/<subcategory>/buy|rent       listings
 *   /<category>/<subcategory>/<product>      product page
 *
 * e.g. /aerial-work-platforms/boom-lifts/buy
 *
 * The old-site addresses (/category-by-subcategory/…, /product-category-buy|rental/…,
 * /product-detail/…) permanently redirect here.
 */

import { brandRedirect, moved } from "./brandRedirects";

export type ListingMode = "buy" | "rental";

/**
 * Address segments differ from the CMS slugs where the plural reads better; CMS slugs stay
 * as they are (products, listings and imports reference them). Singular addresses redirect.
 */
const CATEGORY_SEGMENTS: Record<string, string> = {
  "aerial-work-platform": "aerial-work-platforms",
  "aluminium-scaffold": "aluminium-scaffolds",
};
const SUBCATEGORY_SEGMENTS: Record<string, string> = {
  "vertical-lift": "vertical-lifts",
  "scissor-lift": "scissor-lifts",
  "boom-lift": "boom-lifts",
  "spider-lift": "spider-lifts",
  "duct-lifter": "duct-lifters",
  "order-picker": "order-pickers",
  "knuckle-boom-crane": "knuckle-boom-cranes",
  "low-reach-platform": "low-reach-platforms",
  "mobile-light-tower": "mobile-light-towers",
  "porta-deck": "porta-decks",
  "porta-mat": "porta-mats",
  "porta-pad": "porta-pads",
};
const invert = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k]));
const CATEGORY_SLUGS = invert(CATEGORY_SEGMENTS);
const SUBCATEGORY_SLUGS = invert(SUBCATEGORY_SEGMENTS);

export const categorySegment = (cat: string) => CATEGORY_SEGMENTS[cat] ?? cat;
export const subcategorySegment = (sub: string) => SUBCATEGORY_SEGMENTS[sub] ?? sub;
/** Address segment (plural or not) -> CMS slug. */
export const categorySlug = (seg: string) => CATEGORY_SLUGS[seg] ?? seg;
export const subcategorySlug = (seg: string) => SUBCATEGORY_SLUGS[seg] ?? seg;

const subcategoryPath = (cat: string, sub: string) => `/${categorySegment(cat)}/${subcategorySegment(sub)}`;

/** This site's own product address, even when the product moved to a brand website. */
export const productPath = (p: { slug: string; category?: string | null; subcategory?: string | null }) =>
  p.category && p.subcategory ? `${subcategoryPath(p.category, p.subcategory)}/${p.slug}` : `/product-detail/${p.slug}`;

// Links to ranges that moved to a group brand website (brand-redirects.json) go straight there.
export const categoryHref = (cat: string) => moved(`/${categorySegment(cat)}`);
export const subcategoryHref = (cat: string, sub: string) => moved(subcategoryPath(cat, sub));
export const listingHref = (mode: ListingMode, cat: string, sub: string) =>
  moved(`${subcategoryPath(cat, sub)}/${mode === "buy" ? "buy" : "rent"}`);
export const productHref = (p: { slug: string; category?: string | null; subcategory?: string | null }) => moved(productPath(p));
/**
 * A product's address, opening with Rent selected when `rent` is asked for and the machine is
 * also for sale (a rent-only machine opens on Rent anyway).
 */
export const productLink = (
  p: { slug: string; category?: string | null; subcategory?: string | null; buy: boolean; rent: boolean },
  rent: boolean,
) => `${productHref(p)}${rent && p.rent && p.buy ? "?for=rent" : ""}`;

/**
 * Route params -> CMS slugs, plus whether the address used the canonical segments (when not,
 * e.g. a singular, the page redirects to the canonical one).
 */
export function resolveSegments(catSeg: string): { category: string; canonical: boolean };
export function resolveSegments(
  catSeg: string,
  subSeg: string,
): { category: string; subcategory: string; canonical: boolean };
export function resolveSegments(catSeg: string, subSeg?: string) {
  const category = categorySlug(catSeg);
  if (subSeg === undefined) return { category, canonical: catSeg === categorySegment(category) };
  const subcategory = subcategorySlug(subSeg);
  return {
    category,
    subcategory,
    canonical: catSeg === categorySegment(category) && subSeg === subcategorySegment(subcategory),
  };
}

// A link to this site (path only or full URL) and its path; the same inside an href attribute.
const OWN_PATH = /^(?:https?:\/\/(?:www\.)?mtandt\.com)?(\/[^?#\s]*)/;
const OWN_HREF = /(href=["'])(?:https?:\/\/(?:www\.)?mtandt\.com)?(\/[^"'?#\s]*)/g;

/** Rewrites an old-site catalogue link (e.g. one saved in the CMS) to its current address. */
export function modernizeHref(href: string): string {
  const own = href.match(OWN_PATH);
  const brand = own && brandRedirect(own[1]);
  if (brand) return brand;
  let m = href.match(/^\/product-category-(buy|rental|rentel)\/([^/?#]+)\/([^/?#]+)\/?$/);
  if (m) return listingHref(m[1] === "buy" ? "buy" : "rental", m[2], m[3]);
  m = href.match(/^\/category-by-subcategory\/([^/?#]+)\/?$/);
  if (m) return categoryHref(m[1]);
  return href;
}

const OLD_LINK =
  /(?:https?:\/\/(?:www\.)?mtandt\.com)?\/(?:product-category-(buy|rental|rentel)\/([a-z0-9-]+)\/([a-z0-9-]+)|category-by-subcategory\/([a-z0-9-]+))(?=["'\s?#<]|\/?$|\/["'])/g;

/**
 * Rewrites old catalogue links inside text/HTML (CMS content) to their current addresses, and
 * links to pages that moved to a group brand website to that website.
 */
export const modernizeLinks = (text: string) => {
  const out = text.replace(OLD_LINK, (_m, mode, cat, sub, catOnly) =>
    catOnly ? categoryHref(catOnly) : listingHref(mode === "buy" ? "buy" : "rental", cat, sub),
  );
  if (OWN_PATH.test(out) && !/\s/.test(out)) return modernizeHref(out);
  return out.replace(OWN_HREF, (m, attr: string, path: string) => {
    const brand = brandRedirect(path);
    return brand ? `${attr}${brand}` : m;
  });
};

/** Applies `modernizeLinks` to every string in a plain JSON-like value. */
export function modernizeDeep<T>(value: T): T {
  if (typeof value === "string") return modernizeLinks(value) as T;
  if (Array.isArray(value)) return value.map(modernizeDeep) as T;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, modernizeDeep(v)])) as T;
  return value;
}

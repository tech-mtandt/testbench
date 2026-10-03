import { permanentRedirect } from "next/navigation";

const buyListing = (cat: string, sub: string) => `/product-category-buy/${cat}/${sub}`;
const rentListing = (cat: string, sub: string) => `/product-category-rental/${cat}/${sub}`;

/**
 * Old-site URLs (from www.mtandt.com's sitemap, checked live before the cutover) that have no
 * page here, mapped to the closest equivalent. Only consulted when a page isn't found, so a
 * product/page later added in the CMS under one of these addresses takes over automatically.
 * Test/junk pages from the old site (e.g. /product-detail/test) are deliberately left out.
 */
export const legacyRedirects: Record<string, string> = {
  // Same product, renamed slug
  "/product-detail/s13f-spider-lift": "/product-detail/track-mounted-spider-lift-s-13-f",
  "/product-detail/track-mounted-spider-lift-s13f": "/product-detail/track-mounted-spider-lift-s-13-f",
  "/product-detail/s13f-spider-lift-rent": "/product-detail/track-mounted-spider-lift-rent-s13f",
  "/product-detail/track-mounted-spider-lift-s15": "/product-detail/track-mounted-spider-lift-s-15",
  "/product-detail/articulated-boom-lift-bt24rt": "/product-detail/telescopic-boom-lift-bt24rt",
  "/product-detail/rent-m5-mobile-light-tower": "/product-detail/m5-mobile-light-tower",
  "/product-detail/self-propelled-mast-boom-vertical-lift-wheel-880": "/product-detail/self-propelled-mast-boom-lift-electric-880r",
  "/product-detail/podium-platform": buyListing("aluminium-scaffold", "low-reach-platform"),

  // Products not carried over: closest listing
  ...Object.fromEntries(
    ["pl-200", "pl-300", "ps-200", "pt-200", "pt-200-h", "gd-300", "tl-100", "tl-200", "tl-300", "tl-400", "tl-500-1", "tl-500-2"].map(
      (m) => [`/product-detail/${m}-mobile-light-tower`, buyListing("mlit", "mobile-light-tower")],
    ),
  ),
  ...Object.fromEntries(
    ["1000r", "1100r"].map((m) => [`/product-detail/self-propelled-mast-boom-vertical-electric-lift-${m}`, buyListing("aerial-work-platform", "vertical-lift")]),
  ),
  "/product-detail/self-propelled-mast-boom-vertical-lift-wheel-12re": buyListing("aerial-work-platform", "vertical-lift"),
  "/product-detail/self-propelled-mast-boom-vertical-lift-wheel-13e": buyListing("aerial-work-platform", "vertical-lift"),
  "/product-detail/self-propelled-scissor-lift": buyListing("aerial-work-platform", "scissor-lift"),
  "/product-detail/articulated-knuckle-boom-crane": buyListing("material-handling-equipment", "knuckle-boom-crane"),
  "/product-detail/articulated-knuckle-boom-crane-rent": rentListing("material-handling-equipment", "knuckle-boom-crane"),
  ...Object.fromEntries(
    ["self-propelled-order-picker", "self-propelled-order-picker-sprint-lp", "sprint-order-picker", "sprint-self-propelled-order-picker"].map((s) => [
      `/product-detail/${s}`,
      buyListing("material-handling-equipment", "order-picker"),
    ]),
  ),
  ...Object.fromEntries(
    ["self-propelled-order-picker-rent-2", "self-propelled-order-picker-sprint-lp-rent", "sprint-order-picker-rent", "sprint-self-propelled-order-picker-rent"].map(
      (s) => [`/product-detail/${s}`, rentListing("material-handling-equipment", "order-picker")],
    ),
  ),
  "/custom-product-detail-buy/mlit/battery-power-stations": buyListing("mlit", "battery-power-stations"),
  "/custom-product-detail-buy/mlit/mobile-light-tower": buyListing("mlit", "mobile-light-tower"),

  // Category-level pages that became custom products / listings
  "/category-by-subcategory/skylight-mesh": "/custom-product-detail-buy/fall-protection-lifeline-systems/skylight-mesh",
  "/product-category-rental/aerial-work-platform/porta-pad": "/custom-product-detail-buy/temporary-road-mats/porta-pad",
  "/custom-product-detail-buy/tools-and-supplies/web-systems-international": "/category-by-subcategory/web-systems-international",
  "/custom-product-detail-buy/fall-protection-lifeline-systems/safety-barriers-system":
    "/custom-product-detail-buy/fall-protection-lifeline-systems/safety-barrier-system",
};

const decode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** Call just before notFound(): redirects if the path is a known old-site URL. */
export function redirectLegacy(path: string) {
  const target = legacyRedirects[path] ?? legacyRedirects[decode(path)];
  if (target) permanentRedirect(target);
}

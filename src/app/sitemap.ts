import type { MetadataRoute } from "next";
import { getCaseStudySlugs } from "@/content/caseStudies";
import { customProductParams } from "@/content/customProducts";
import { getIndustrySlugs } from "@/content/industries";
import { getLegalPages } from "@/content/legal";
import { events, getBlogSlugs, pressItems } from "@/content/media";
import { allProducts, getCatalog, hasListing, listingHref, type Mode } from "@/content/products";
import { getServiceSlugs } from "@/content/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

// Rebuilt hourly (and on any admin change, via the CMS revalidation hooks).
export const revalidate = 3600;

const STATIC = [
  "/",
  "/about-us",
  "/products",
  "/services",
  "/catalogues",
  "/industries",
  "/media",
  "/media/press",
  "/media/events",
  "/media/gallery",
  "/career",
  "/contact-us",
  "/customers",
  "/dealer",
  "/vendors",
  "/annual-returns",
];

/** One section failing (e.g. a DB hiccup) must not empty the whole sitemap. */
async function paths(load: () => Promise<string[]>): Promise<string[]> {
  try {
    return await load();
  } catch (err) {
    console.error("[sitemap]", err);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const groups = await Promise.all([
    paths(async () => (await allProducts()).map((p) => `/product-detail/${p.slug}`)),
    paths(async () => {
      const c = await getCatalog();
      return (["buy", "rental"] as Mode[]).flatMap((mode) =>
        c.categories.flatMap((cat) => [
          ...(mode === "buy" ? [`/category-by-subcategory/${cat.slug}`] : []),
          ...cat.subcategories.filter((s) => hasListing(c, mode, cat.slug, s.slug)).map((s) => listingHref(mode, cat.slug, s.slug)),
        ]),
      );
    }),
    paths(async () => {
      const out: string[] = [];
      for (const kind of ["buy", "rental"] as const) {
        // First entry per slug is the canonical category; the rest are old aliases.
        const seen = new Set<string>();
        for (const { category, slug } of await customProductParams(kind)) {
          if (seen.has(slug)) continue;
          seen.add(slug);
          out.push(`/custom-product-detail-${kind}/${category}/${slug}`);
        }
      }
      return out;
    }),
    paths(async () => (await getServiceSlugs()).map((s) => `/services/${s}`)),
    paths(async () => (await getIndustrySlugs()).map((s) => `/industries/${s}`)),
    paths(async () => (await getCaseStudySlugs()).map((s) => `/casestudy/${s}`)),
    paths(async () => (await events()).map((e) => `/event/${e.slug}`)),
    paths(async () => (await pressItems()).map((p) => `/press/${p.slug}`)),
    paths(async () => (await getBlogSlugs()).map((s) => `/blogs/${encodeURIComponent(s)}`)),
    paths(async () => Object.keys(await getLegalPages()).map((s) => `/pages/${s}`)),
  ]);
  const all = [...new Set([...STATIC, ...groups.flat()])];
  return all.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` }));
}

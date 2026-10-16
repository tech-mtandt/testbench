/**
 * Applies the October 2026 catalogue update (src/cms/import/catalogUpdate.ts) to the scraped
 * fallback catalogue, so the site shows the same products when the CMS is unreachable, and
 * writes src/content/renamed-products.json (old slug -> new slug) for redirects.
 * The CMS itself is updated by the admin import task "catalog-update-2026-10".
 *
 * Idempotent: node --import tsx migration/apply-catalog-update.mts
 */
import { readFileSync, writeFileSync } from "fs";
import {
  NEW_MODELS,
  newModelSlug,
  newModelTitle,
  renameModelIn,
  renamedSlug,
  stripSupplier,
  updatedProduct,
} from "../src/cms/import/catalogUpdate";

const PRODUCTS = "src/content/scraped/products.json";
const TAXONOMY = "src/content/scraped/product-categories.json";
const RENAMED = "src/content/renamed-products.json";

const products = JSON.parse(readFileSync(PRODUCTS, "utf8"));
const tax = JSON.parse(readFileSync(TAXONOMY, "utf8"));
const renamed: Record<string, string> = JSON.parse(readFileSync(RENAMED, "utf8").toString() || "{}");

const slugMap: Record<string, string> = {};
for (const p of products) {
  const u = updatedProduct(p.title, p.model, p.subcategory);
  const oldModel = p.model && u.model !== p.model ? p.model : null;
  const fix = (s: string) => {
    let out = stripSupplier(s);
    if (oldModel && u.model) out = renameModelIn(out, oldModel, u.model);
    return out;
  };
  p.title = u.title;
  if (oldModel) {
    p.model = u.model;
    p.row = p.row.map(([k, v]: [string, string]) => [k, k === "Model No" ? u.model : v]);
  }
  for (const f of ["descriptionHtml", "featuresHtml", "optionsHtml"]) if (p[f]) p[f] = fix(p[f]);
  for (const f of ["title", "description", "keywords"]) if (p.meta?.[f]) p.meta[f] = fix(p.meta[f]);
  const slug = renamedSlug(p.slug, u.model);
  if (slug) {
    slugMap[p.slug] = slug;
    p.slug = slug;
  }
}
for (const p of products) p.related = (p.related ?? []).map((s: string) => slugMap[s] ?? s);
for (const l of Object.values(tax.listings) as { products: string[] }[]) l.products = l.products.map((s) => slugMap[s] ?? s);

const cat = tax.categories.find((c: { slug: string }) => c.slug === "aerial-work-platform");
const have = new Set(products.map((p: { slug: string }) => p.slug));
let added = 0;
for (const n of NEW_MODELS) {
  for (const mode of ["buy", "rent"] as const) {
    const slug = newModelSlug(n, mode);
    const key = `${mode === "buy" ? "buy" : "rental"}/aerial-work-platform/${n.subcategory}`;
    if (!have.has(slug)) {
      products.push({
        slug,
        legacyId: null,
        dbId: null,
        title: newModelTitle(n),
        model: n.model,
        mode,
        category: "aerial-work-platform",
        subcategory: n.subcategory,
        categoryName: cat.title,
        subcategoryName: cat.subcategories.find((s: { slug: string }) => s.slug === n.subcategory)?.name ?? "",
        image: null,
        gallery: [],
        descriptionHtml: "",
        specs: [],
        featuresHtml: "",
        optionsHtml: "",
        applications: [],
        download: null,
        charts: [],
        related: [],
        meta: {},
        row: [["Model No", n.model]],
        facets: {},
        num: {},
      });
      have.add(slug);
      added++;
    }
    const listing = tax.listings[key];
    if (listing && !listing.products.includes(slug)) listing.products.push(slug);
    else if (!listing) console.warn(`no listing ${key} for ${slug}`);
  }
}

// Chains collapse (a -> b, b -> c  =>  a -> c), and earlier runs' entries are kept.
const all = { ...renamed, ...slugMap };
for (const k of Object.keys(all)) while (all[all[k]]) all[k] = all[all[k]];

writeFileSync(PRODUCTS, JSON.stringify(products, null, 1));
writeFileSync(TAXONOMY, JSON.stringify(tax, null, 1));
writeFileSync(RENAMED, JSON.stringify(all, null, 2) + "\n");
console.log(`renamed slugs: ${Object.keys(slugMap).length}, new products: ${added}, total products: ${products.length}`);

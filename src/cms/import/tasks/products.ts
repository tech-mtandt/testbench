import taxonomyJson from "@/content/scraped/product-categories.json";
import productsJson from "@/content/scraped/products.json";
import customJson from "@/content/scraped/custom-products.json";
import type { Category, FacetKey, Mode, Product } from "@/content/products";
import type { CustomProduct, Kind } from "@/content/customProducts";

import { document, eachTask, lexical, mapSeq, media, pairs, upsert } from "../helpers";
import type { ImportContext, ImportTask } from "../types";

/**
 * Products area: filter values -> categories -> products -> listings -> related links ->
 * custom products. Products are matched by slug (unique across buy and rent in the
 * scraped data). The live DB already holds ~80 of them from the first migration (title,
 * image and description only, no `mode`): a product without a `mode` counts as not yet
 * imported and is filled in place, keeping its id.
 */

type Taxonomy = {
  categories: Category[];
  aliases: Record<string, string>;
  listings: Record<string, { title: string; description: string; columns: string[]; sorts: { label: string; field: string; dir: string }[]; meta: Record<string, string>; products: string[] }>;
  facets: Record<FacetKey, Record<string, string>>;
};

const tax = taxonomyJson as unknown as Taxonomy;
const products = productsJson as unknown as Product[];
const custom = customJson as unknown as Record<Kind, Record<string, CustomProduct>> & { aliases: Record<string, string> };

const seo = (meta: { title?: string | null; description?: string | null } | undefined) => ({
  title: meta?.title || undefined,
  description: meta?.description || undefined,
});

// ---------- id lookups (per import run; reloaded when a key is missing) ----------

async function idBy(ctx: ImportContext, collection: "product-categories" | "products", slugs: string[]) {
  const wanted = [...new Set(slugs.filter(Boolean))];
  if (!wanted.length) return new Map<string, number>();
  const { docs } = await ctx.payload.find({
    collection,
    where: { slug: { in: wanted } },
    limit: 0,
    pagination: false,
    depth: 0,
    req: ctx.req,
  });
  return new Map(docs.map((d) => [d.slug as string, d.id as number]));
}

// Filter value ids by "type:legacyId", loaded once per import call.
const attrCache = new WeakMap<ImportContext, Map<string, number>>();

async function attributeIds(ctx: ImportContext, type: FacetKey, legacy: string[]): Promise<number[]> {
  const key = (t: string, id: string) => `${t}:${id}`;
  let attrIds = attrCache.get(ctx);
  if (!attrIds || legacy.some((id) => !attrIds!.has(key(type, id)))) {
    const { docs } = await ctx.payload.find({
      collection: "product-attributes",
      limit: 0,
      pagination: false,
      depth: 0,
      req: ctx.req,
    });
    attrIds = new Map(docs.filter((d) => d.legacyId).map((d) => [key(d.type, d.legacyId!), d.id]));
    attrCache.set(ctx, attrIds);
  }
  return legacy.map((id) => attrIds!.get(key(type, id))).filter((x): x is number => x != null);
}

// ---------- tasks ----------

const attributeItems = () =>
  (Object.entries(tax.facets) as [FacetKey, Record<string, string>][]).flatMap(([type, values]) =>
    Object.entries(values).map(([legacyId, label]) => ({ type, legacyId, label })),
  );

const attributesTask = eachTask("products-attributes", "Product filter values", attributeItems, async (ctx, a) => {
  await upsert(
    ctx,
    "product-attributes",
    { and: [{ type: { equals: a.type } }, { legacyId: { equals: a.legacyId } }] },
    { type: a.type, legacyId: a.legacyId, label: a.label },
  );
});

const categoriesTask = eachTask("products-categories", "Product categories", () => tax.categories, async (ctx, c, i) => {
  await upsert(
    ctx,
    "product-categories",
    { slug: { equals: c.slug } },
    {
      title: c.title,
      slug: c.slug,
      crumb: c.crumb,
      intro: c.intro,
      order: i,
      aliases: Object.entries(tax.aliases)
        .filter(([from, to]) => to === c.slug && from !== c.slug)
        .map(([from]) => from),
      subcategories: await mapSeq(c.subcategories, async (s) => ({
        slug: s.slug,
        name: s.name,
        html: await lexical(ctx, s.html),
        button: s.button
          ? { label: s.button.label, href: s.button.href ?? null, choose: Boolean(s.button.choose) }
          : { label: null, href: null, choose: false },
        faqs: await mapSeq(s.faqs, async (f) => ({ q: f.q, a: await lexical(ctx, f.a) })),
      })),
      meta: seo(c.meta),
      metaKeywords: c.meta.keywords ?? "",
    },
  );
});

const productsTask = eachTask("products-items", "Products", () => products, async (ctx, p, i) => {
  const found = await ctx.payload.find({
    collection: "products",
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
    req: ctx.req,
  });
  let existing = found.docs[0];
  if (!existing && p.dbId) {
    // Fallback to the linked doc when its slug was changed (same product title, not filled yet).
    const byId = await ctx.payload.findByID({ collection: "products", id: p.dbId, depth: 0, req: ctx.req, disableErrors: true });
    if (byId && !byId.mode && byId.title.trim().toLowerCase() === p.title.trim().toLowerCase()) existing = byId;
  }
  // Docs from the first migration have no mode yet: fill them even without overwrite.
  if (existing?.mode && !ctx.overwrite) {
    // Repair links an earlier, interrupted run couldn't make (categories or PDFs weren't there
    // yet). Only fills empty fields, so admin edits are never touched.
    const patch: Record<string, unknown> = {};
    if (!existing.productCategory && p.category) {
      const id = (await idBy(ctx, "product-categories", [p.category])).get(p.category);
      if (id) patch.productCategory = id;
    }
    if (!existing.downloads?.length && p.download) {
      const file = await document(ctx, p.download);
      if (file) patch.downloads = [{ label: "Brochure", file }];
    }
    if (Object.keys(patch).length) {
      await ctx.payload.update({ collection: "products", id: existing.id, data: patch as any, depth: 0, req: ctx.req });
      ctx.log(`  updated products ${p.slug} (filled ${Object.keys(patch).join(", ")})`);
    } else ctx.log(`  skipped products ${p.slug} (exists)`);
    return;
  }

  const cats = await idBy(ctx, "product-categories", [p.category ?? ""]);
  const facets: Record<string, number[]> = {};
  for (const type of Object.keys(tax.facets) as FacetKey[]) {
    facets[type] = await attributeIds(ctx, type, p.facets[type] ?? []);
  }
  const download = await document(ctx, p.download);
  const data: Record<string, unknown> = {
    title: p.title,
    slug: p.slug,
    mode: p.mode,
    legacyId: p.legacyId,
    order: i,
    modelNo: p.model || null,
    featuredImage: await media(ctx, p.image, p.title),
    gallery: (await mapSeq(p.gallery, (src) => media(ctx, src, p.title)))
      .filter((id): id is number => id != null)
      .map((image) => ({ image })),
    content: await lexical(ctx, p.descriptionHtml),
    productCategory: (p.category && cats.get(p.category)) || null,
    subcategory: p.subcategory,
    specifications: pairs(p.specs),
    features: await lexical(ctx, p.featuresHtml),
    optionsContent: await lexical(ctx, p.optionsHtml),
    applications: p.applications.map((application) => ({ application })),
    downloads: download ? [{ label: "Brochure", file: download }] : [],
    charts: (await mapSeq(p.charts, (src) => media(ctx, src, `${p.title} chart`)))
      .filter((id): id is number => id != null)
      .map((image) => ({ image })),
    listingRow: pairs(p.row),
    facets,
    workingHeight: p.num.working_height ?? null,
    machineWeight: p.num.machine_weight ?? null,
    maxLiftingCapacity: p.num.mhe_maxliftingcapacity ?? null,
    maxLiftingHeight: p.num.mhe_maxliftingheight ?? null,
    meta: seo(p.meta),
    metaKeywords: p.meta.keywords || null,
  };
  if (existing) {
    await ctx.payload.update({ collection: "products", id: existing.id, data: data as any, depth: 0, req: ctx.req });
    ctx.log(`  ${existing.mode ? "updated" : "filled"} products ${p.slug}`);
  } else {
    await ctx.payload.create({ collection: "products", data: data as any, depth: 0, req: ctx.req });
    ctx.log(`  created products ${p.slug}`);
  }
});

const listingItems = () => Object.entries(tax.listings);

const listingsTask = eachTask("products-listings", "Product listings", listingItems, async (ctx, [key, l]) => {
  const [mode, cat, sub] = key.split("/") as [Mode, string, string];
  const cats = await idBy(ctx, "product-categories", [cat]);
  const catId = cats.get(cat);
  if (!catId) {
    ctx.log(`  ! listing ${key}: category ${cat} not imported`);
    return;
  }
  const ids = await idBy(ctx, "products", l.products);
  await upsert(
    ctx,
    "product-listings",
    { and: [{ mode: { equals: mode } }, { productCategory: { equals: catId } }, { subcategory: { equals: sub } }] },
    {
      mode,
      productCategory: catId,
      subcategory: sub,
      title: l.title,
      description: l.description,
      columns: l.columns,
      sorts: l.sorts.map((s) => ({ label: s.label, field: s.field, dir: s.dir })),
      products: l.products.map((s) => ids.get(s)).filter((x): x is number => x != null),
      meta: seo(l.meta),
      metaKeywords: l.meta.keywords || null,
    },
  );
});

const relatedTask = eachTask("products-related", "Related products", () => products, async (ctx, p) => {
  const found = await ctx.payload.find({
    collection: "products",
    where: { slug: { equals: p.slug } },
    limit: 1,
    depth: 0,
    req: ctx.req,
  });
  const doc = found.docs[0];
  if (!doc || (doc.related?.length && !ctx.overwrite)) return;
  const ids = await idBy(ctx, "products", p.related);
  const related = p.related.map((s) => ids.get(s)).filter((x): x is number => x != null);
  if (!related.length) return;
  await ctx.payload.update({ collection: "products", id: doc.id, data: { related }, depth: 0, req: ctx.req });
});

const customItems = () =>
  (["buy", "rental"] as Kind[]).flatMap((kind) => Object.entries(custom[kind]).map(([slug, p]) => ({ kind, slug, p })));

const customTask = eachTask("products-custom", "Custom products", customItems, async (ctx, { kind, slug, p }) => {
  const img = (src: unknown, alt?: string | null) => media(ctx, src, alt);
  await upsert(
    ctx,
    "custom-products",
    { and: [{ kind: { equals: kind } }, { slug: { equals: slug } }] },
    {
      kind,
      slug,
      title: p.title,
      category: p.category,
      altCategories: Object.entries(custom.aliases)
        .filter(([, to]) => to === p.category)
        .map(([from]) => from),
      productId: p.productId,
      hero: await img(p.hero, p.title),
      crumb: { label: p.crumb.label, href: p.crumb.href },
      intro: await lexical(ctx, p.intro),
      specs: pairs(p.specs),
      features: await lexical(ctx, p.features),
      benefits: await lexical(ctx, p.benefits),
      download: await document(ctx, p.download),
      journey: await mapSeq(p.journey, async (j) => ({ title: j.title, html: await lexical(ctx, j.html) })),
      gallery: {
        filters: (p.gallery?.filters ?? []).map((f) => ({ filterId: f.id, label: f.label })),
        items: (
          await mapSeq(p.gallery?.items ?? [], async (it) => ({
            image: await img(it.image, it.title),
            title: it.title,
            caption: it.caption,
            filters: it.filters,
          }))
        ).filter((it) => it.image != null),
      },
      related: await mapSeq(p.related, async (r) => ({ title: r.title, href: r.href, image: await img(r.image, r.title) })),
      clients: (await mapSeq(p.clients, (src) => img(src, "Client logo")))
        .filter((id): id is number => id != null)
        .map((logo) => ({ logo })),
      meta: seo(p.meta),
      metaKeywords: p.meta.keywords || null,
    },
  );
});

export const productsTasks: ImportTask[] = [
  attributesTask,
  categoriesTask,
  productsTask,
  listingsTask,
  relatedTask,
  customTask,
];

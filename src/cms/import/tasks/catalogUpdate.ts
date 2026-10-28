import type { ImportContext, ImportTask } from "../types";
import { outOfTime } from "../helpers";
import {
  NEW_MODELS,
  mentionsSupplier,
  newModelSlug,
  newModelTitle,
  renameModelIn,
  renamedSlug,
  stripSupplier,
  updatedProduct,
} from "../catalogUpdate";

/**
 * Admin import task for the October 2026 catalogue update (see ../catalogUpdate): cleans
 * every existing product (supplier names out of titles, copy, SEO text and slugs; renamed
 * models), then creates the new models for buy and rent and adds them to their listings.
 * Idempotent and resumable: re-running changes nothing that is already up to date.
 */

const CATEGORY = "aerial-work-platform";

type Lexical = { root?: unknown } | null | undefined;

/** Apply `fix` to every text node of a Lexical document; returns null when nothing changed. */
function fixLexical(doc: Lexical, fix: (s: string) => string): Lexical | null {
  if (!doc || typeof doc !== "object") return null;
  let changed = false;
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!node || typeof node !== "object") return node;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "text" && typeof v === "string") {
        const next = fix(v);
        if (next !== v) changed = true;
        out[k] = next;
      } else out[k] = walk(v);
    }
    return out;
  };
  const next = walk(doc) as Lexical;
  return changed ? next : null;
}

type ProductRow = {
  id: number;
  slug: string;
  title: string;
  modelNo?: string | null;
  mode?: string | null;
  subcategory?: string | null;
  listingRow?: { label: string; value: string }[] | null;
  content?: Lexical;
  features?: Lexical;
  optionsContent?: Lexical;
  meta?: { title?: string | null; description?: string | null } | null;
  metaKeywords?: string | null;
};

async function cleanProduct(ctx: ImportContext, d: ProductRow) {
  const u = updatedProduct(d.title, d.modelNo, d.subcategory);
  const oldModel = d.modelNo && u.model !== d.modelNo ? d.modelNo : null;
  const fix = (s: string) => {
    let out = stripSupplier(s);
    if (oldModel && u.model) out = renameModelIn(out, oldModel, u.model);
    return out;
  };
  const patch: Record<string, unknown> = {};
  if (u.title !== d.title) patch.title = u.title;
  if (oldModel) {
    patch.modelNo = u.model;
    patch.listingRow = (d.listingRow ?? []).map((r) => (r.label === "Model No" ? { ...r, value: u.model } : r));
  }
  const slug = renamedSlug(d.slug, u.model);
  if (slug) patch.slug = slug;
  for (const field of ["content", "features", "optionsContent"] as const) {
    const next = fixLexical(d[field], fix);
    if (next) patch[field] = next;
  }
  const meta = { title: d.meta?.title ?? null, description: d.meta?.description ?? null };
  const fixedMeta = { title: meta.title && fix(meta.title), description: meta.description && fix(meta.description) };
  if (fixedMeta.title !== meta.title || fixedMeta.description !== meta.description) patch.meta = { ...d.meta, ...fixedMeta };
  if (d.metaKeywords && mentionsSupplier(d.metaKeywords)) patch.metaKeywords = fix(d.metaKeywords);
  if (!Object.keys(patch).length) return;
  await ctx.payload.update({ collection: "products", id: d.id, data: patch as never, depth: 0, req: ctx.req });
  ctx.log(`  updated ${d.slug}${slug ? ` -> ${slug}` : ""} (${Object.keys(patch).join(", ")})`);
}

const newItems = NEW_MODELS.flatMap((n) => (["buy", "rent"] as const).map((mode) => ({ ...n, mode })));
const newSlugs = new Set(newItems.map((n) => newModelSlug(n, n.mode)));

async function createModel(ctx: ImportContext, item: (typeof newItems)[number], categoryId: number, order: number) {
  const slug = newModelSlug(item, item.mode);
  const found = await ctx.payload.find({ collection: "products", where: { slug: { equals: slug } }, limit: 1, depth: 0, req: ctx.req });
  let id = found.docs[0]?.id as number | undefined;
  if (!id) {
    const doc = await ctx.payload.create({
      collection: "products",
      data: {
        title: newModelTitle(item),
        slug,
        mode: item.mode,
        forSale: item.mode === "buy",
        forRent: item.mode === "rent",
        modelNo: item.model,
        order,
        productCategory: categoryId,
        subcategory: item.subcategory,
        listingRow: [{ label: "Model No", value: item.model }],
      } as never,
      depth: 0,
      req: ctx.req,
    });
    id = doc.id as number;
    ctx.log(`  created ${slug}`);
  }
  // Add it to its buy/rent listing (end of the list) if it isn't there yet.
  const listing = (
    await ctx.payload.find({
      collection: "product-listings",
      where: {
        and: [
          { mode: { equals: item.mode === "buy" ? "buy" : "rental" } },
          { productCategory: { equals: categoryId } },
          { subcategory: { equals: item.subcategory } },
        ],
      },
      limit: 1,
      depth: 0,
      req: ctx.req,
    })
  ).docs[0] as { id: number; products?: (number | { id: number })[] } | undefined;
  if (!listing) {
    ctx.log(`  ! no ${item.mode} listing for ${item.subcategory}; ${slug} not listed`);
    return;
  }
  const ids = (listing.products ?? []).map((p) => (typeof p === "object" ? p.id : p));
  if (!ids.includes(id)) {
    await ctx.payload.update({ collection: "product-listings", id: listing.id, data: { products: [...ids, id] } as never, depth: 0, req: ctx.req });
    ctx.log(`  listed ${slug} on ${item.mode} ${item.subcategory}`);
  }
}

export const catalogUpdateTask: ImportTask = {
  key: "catalog-update-2026-10",
  label: "Catalogue update (Oct 2026): new aerial work platforms, renamed models, no supplier names",
  async run(ctx, cursor) {
    // The models this task creates are left out, so the resume cursor stays stable across calls.
    const existing = (
      (await ctx.payload.find({ collection: "products", limit: 0, pagination: false, depth: 0, sort: "id", req: ctx.req }))
        .docs as unknown as ProductRow[]
    ).filter((d) => !newSlugs.has(d.slug));
    const category = (
      await ctx.payload.find({ collection: "product-categories", where: { slug: { equals: CATEGORY } }, limit: 1, depth: 0, req: ctx.req })
    ).docs[0];
    if (!category) throw new Error(`category ${CATEGORY} not found`);
    const maxOrder = existing.reduce((m, d) => Math.max(m, Number((d as { order?: number }).order ?? 0)), 0);

    const total = existing.length + newItems.length;
    for (let i = cursor; i < total; i++) {
      if (i > cursor && outOfTime(ctx)) return i;
      try {
        if (i < existing.length) await cleanProduct(ctx, existing[i]);
        else {
          const j = i - existing.length;
          await createModel(ctx, newItems[j], category.id as number, maxOrder + 1 + j);
        }
      } catch (err) {
        ctx.log(`  ! item #${i}: ${(err as Error).message.split("\n")[0]}`);
      }
    }
    return null;
  },
};

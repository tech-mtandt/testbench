/**
 * Product CSV import, database side: works out what each row will do (preview) and does it
 * (import), a slice at a time so long files fit the request time limit. Re-running a file is
 * safe: products are matched by model number and buy/rent, never duplicated.
 */
import type { Payload, PayloadRequest } from "payload";
import { categoryHref } from "../../content/urls";
import { lexical } from "./helpers";
import { type CsvRow, type Mode, type Range, cardRows, modelKey, newSlug, rangeKey, rangeName, readCsv, sortValues, specRows } from "./productCsv";

type Product = {
  id: number;
  slug: string;
  title: string;
  modelNo?: string | null;
  mode?: string | null;
  subcategory?: string | null;
  order?: number | null;
  specifications?: { label: string; value: string }[] | null;
  listingRow?: { label: string; value: string }[] | null;
};
type Listing = { id: number; mode: string; subcategory?: string | null; productCategory?: number | { id: number } | null; products?: (number | { id: number })[] | null };

export type PlannedRow = {
  line: number;
  model: string;
  range: string | null;
  title: string;
  actions: { mode: Mode; action: "create" | "update"; slug: string }[];
  errors: string[];
  warnings: string[];
};

const relId = (v: number | { id: number } | null | undefined) => (v && typeof v === "object" ? v.id : (v ?? null));
const listingMode = (m: Mode) => (m === "buy" ? "buy" : "rental");

async function load(payload: Payload, req?: PayloadRequest) {
  const find = async <T>(collection: "products" | "product-listings" | "product-categories") =>
    (await payload.find({ collection, limit: 0, pagination: false, depth: 0, req })).docs as unknown as T[];
  const [categories, listings, products] = await Promise.all([
    find<{ id: number; slug: string; subcategories?: { name: string; slug: string }[] | null }>("product-categories"),
    find<Listing>("product-listings"),
    find<Product>("products"),
  ]);
  // Ranges with a buy or rent listing on this site (not ones moved to a brand website).
  const ranges: Range[] = [];
  for (const c of categories) {
    // Moved categories link to their brand website (brand-redirects.json).
    if (/^https?:/.test(categoryHref(c.slug))) continue;
    for (const s of c.subcategories ?? []) {
      if (!listings.some((l) => relId(l.productCategory) === c.id && l.subcategory === s.slug)) continue;
      const r = { name: rangeName(s.name, s.slug), categoryId: c.id, categorySlug: c.slug, subSlug: s.slug };
      for (const key of new Set([rangeKey(s.slug), rangeKey(s.name)])) ranges.push({ ...r, key });
    }
  }
  const byModel = new Map<string, Product>();
  for (const p of products) if (p.modelNo && p.mode) byModel.set(`${modelKey(p.modelNo)}|${p.mode}`, p);
  return { ranges, listings, products, byModel, slugs: new Set(products.map((p) => p.slug)) };
}

/** Distinct ranges for the panel's "range for this file" choice. */
export async function listRanges(payload: Payload, req?: PayloadRequest) {
  const { ranges } = await load(payload, req);
  return [...new Map(ranges.map((r) => [`${r.categoryId}/${r.subSlug}`, r.name])).values()].sort();
}

function plan(row: CsvRow, data: Awaited<ReturnType<typeof load>>): PlannedRow {
  const errors = [...row.errors];
  const actions: PlannedRow["actions"] = [];
  if (!errors.length && row.range) {
    for (const mode of row.modes) {
      const existing = data.byModel.get(`${modelKey(row.model)}|${mode}`);
      if (existing && existing.subcategory !== row.range.subSlug) {
        errors.push(`${row.model} (${mode}) already exists under ${existing.subcategory ?? "another range"}; not changed`);
        continue;
      }
      if (existing) actions.push({ mode, action: "update", slug: existing.slug });
      else {
        let slug = newSlug(row, mode);
        for (let n = 2; data.slugs.has(slug); n++) slug = `${newSlug(row, mode)}-${n}`;
        actions.push({ mode, action: "create", slug });
      }
    }
  }
  // An update keeps the product's title unless the file has a Title or Type for it.
  const kept = !row.has.title && actions.find((a) => a.action === "update");
  const title = kept ? (data.byModel.get(`${modelKey(row.model)}|${kept.mode}`)?.title ?? row.title) : row.title;
  return { line: row.line, model: row.model, range: row.range?.name ?? null, title, actions, errors, warnings: row.warnings };
}

/** What importing the file would do, row by row. Writes nothing. */
export async function previewCsv(payload: Payload, csv: string, defaultRange: string | null, req?: PayloadRequest) {
  const data = await load(payload, req);
  const { rows, errors } = readCsv(csv, data.ranges, defaultRange);
  return { errors, rows: rows.map((r) => plan(r, data)) };
}

const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`)
    .join("");

/** Import rows from `cursor` until `deadline`; returns the next cursor (null when done) and a log. */
export async function importCsv(payload: Payload, csv: string, defaultRange: string | null, cursor: number, deadline: number, req?: PayloadRequest) {
  const data = await load(payload, req);
  const { rows, errors } = readCsv(csv, data.ranges, defaultRange);
  if (errors.length) throw new Error(errors.join(" "));
  const log: string[] = [];
  const ctx = { payload, req, overwrite: false, deadline, log: (l: string) => log.push(l) };
  let order = data.products.reduce((m, p) => Math.max(m, Number(p.order ?? 0)), 0);

  for (let i = cursor; i < rows.length; i++) {
    if (i > cursor && Date.now() > deadline) return { next: i, log };
    const row = rows[i];
    const p = plan(row, data);
    if (p.errors.length) {
      log.push(`! line ${row.line} ${row.model || ""}: skipped (${p.errors.join("; ")})`);
      continue;
    }
    const range = row.range!;
    const content = row.has.description ? await lexical(ctx, paragraphs(row.description)) : undefined;
    const sort = sortValues(row);
    for (const a of p.actions) {
      try {
        const existing = data.byModel.get(`${modelKey(row.model)}|${a.mode}`);
        // Updates touch only what the file has: specification and listing-card rows are merged
        // by label (new values replace old ones; rows the file doesn't mention stay).
        const merge = (old: { label: string; value: string }[] | null | undefined, rows: [string, string][], max = Infinity) => {
          const merged = new Map((old ?? []).map(({ label, value }) => [label.toLowerCase(), { label, value }]));
          for (const [label, value] of rows) merged.set(label.toLowerCase(), { label, value });
          return [...merged.values()].slice(0, max);
        };
        const fields: Record<string, unknown> = {
          ...(row.has.specs || !existing
            ? { specifications: merge(existing?.specifications, specRows(row)), listingRow: merge(existing?.listingRow, cardRows(row), 3), ...sort }
            : {}),
          ...(row.has.title || !existing ? { title: row.title } : {}),
          ...(content ? { content } : {}),
          ...(row.has.applications ? { applications: row.applications.map((application) => ({ application })) } : {}),
          ...(row.has.seo ? { meta: { ...(row.seoTitle && { title: row.seoTitle }), ...(row.seoDescription && { description: row.seoDescription }) } } : {}),
        };
        let id = existing?.id;
        if (existing) {
          await payload.update({ collection: "products", id: existing.id, data: fields as never, depth: 0, req });
          log.push(`  updated ${existing.slug} (line ${row.line})`);
        } else {
          const doc = await payload.create({
            collection: "products",
            data: { ...fields, slug: a.slug, mode: a.mode, modelNo: row.model, order: ++order, productCategory: range.categoryId, subcategory: range.subSlug } as never,
            depth: 0,
            req,
          });
          id = doc.id as number;
          const added = { id, slug: a.slug, title: row.title, modelNo: row.model, mode: a.mode, subcategory: range.subSlug };
          data.byModel.set(`${modelKey(row.model)}|${a.mode}`, added);
          data.slugs.add(a.slug);
          log.push(`  created ${a.slug} (line ${row.line})`);
        }
        // On its buy/rent listing (at the end) if it isn't there yet.
        const listing = data.listings.find(
          (l) => l.mode === listingMode(a.mode) && relId(l.productCategory) === range.categoryId && l.subcategory === range.subSlug,
        );
        if (!listing) {
          log.push(`! line ${row.line}: no ${a.mode} listing for ${range.name}; ${a.slug} not listed`);
          continue;
        }
        const ids = (listing.products ?? []).map((x) => relId(x) as number);
        if (id && !ids.includes(id)) {
          listing.products = [...ids, id];
          await payload.update({ collection: "product-listings", id: listing.id, data: { products: listing.products } as never, depth: 0, req });
          log.push(`  listed ${a.slug} on ${a.mode} ${range.name}`);
        }
      } catch (err) {
        log.push(`! line ${row.line} ${row.model} (${a.mode}): ${(err as Error).message.split("\n")[0]}`);
      }
    }
  }
  return { next: null, log };
}

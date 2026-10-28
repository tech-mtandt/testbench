import { commitTransaction, createLocalReq, initTransaction, killTransaction, type Payload } from "payload";

import { modelKey } from "../productCsv";
import type { ImportContext, ImportTask } from "../types";

/**
 * One product per machine. Until October 2026 a machine sold and rented had two products: a
 * buy page and a separate rent page ("…-rent", often with a generic title like "SCISSOR LIFT
 * ELECTRIC 8 Mtr"). This merges each pair into the buy product, now Available to buy and to
 * rent: the buy version wins, and only fields the buy copy has empty are filled from the rent
 * copy. The rent copy is kept but hidden (mergedInto), and its address goes into the machine's
 * Old addresses, so it redirects there with Rent selected. "(Copy)" duplicates of a buy page
 * are folded in the same way. Related products and listings that pointed at a hidden copy are
 * re-pointed to the machine.
 *
 * Pairs: same model number (as the CSV import compares them), one buy-only and one rent-only
 * product; products without a model number pair by address ("x" and "x-rent"). Anything less
 * clear-cut (two buy pages of one model, say) is left alone and listed in the log.
 *
 * Safe to stop and re-run: each machine is merged in one transaction, and the plan is worked
 * out again from the database on every run, so merged machines simply drop out of it.
 */

type Rel = number | { id: number } | null | undefined;
type Row = Record<string, unknown>;
type Doc = {
  id: number;
  slug: string;
  title: string;
  modelNo?: string | null;
  forSale?: boolean | null;
  forRent?: boolean | null;
  /** The old buy-or-rent field. */
  mode?: string | null;
  mergedInto?: Rel;
  formerSlugs?: { slug: string; rent?: boolean | null }[] | null;
  related?: Rel[] | null;
  facets?: Record<string, Rel[] | null> | null;
  meta?: { title?: string | null; description?: string | null; image?: Rel } | null;
  [field: string]: unknown;
};
type Listing = { id: number; title: string; products?: Rel[] | null };

/** Fields filled from the rent copy when the buy copy has them empty (facets and SEO by part). */
const FILL = [
  "modelNo",
  "featuredImage",
  "gallery",
  "content",
  "specifications",
  "features",
  "optionsContent",
  "applications",
  "downloads",
  "charts",
  "chartImage",
  "listingRow",
  "workingHeight",
  "machineWeight",
  "maxLiftingCapacity",
  "maxLiftingHeight",
  "productCategory",
  "subcategory",
  "related",
  "metaKeywords",
] as const;

const relId = (v: Rel) => (v && typeof v === "object" ? v.id : (v ?? null));

/** Nothing to show: no value, an empty list, or rich text without any text. */
function empty(v: unknown): boolean {
  if (v == null || v === "") return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "object" && "root" in (v as object)) return !/"text":"\s*[^"\s]/.test(JSON.stringify(v));
  return false;
}

/** Array rows copied to another product get new row ids (the old ones stay with the copy). */
const fresh = (v: unknown) => (Array.isArray(v) ? v.map((r) => (r && typeof r === "object" && !Array.isArray(r) ? { ...(r as Row), id: undefined } : r)) : v);

const listed = (p: Doc) => relId(p.mergedInto) == null && (p.forSale || p.forRent);

type Plan = {
  pairs: { buy: Doc; rent: Doc }[];
  copies: { main: Doc; copy: Doc }[];
  unclear: string[];
  /** Hidden copy id -> machine id, for copies already merged and those about to be. */
  into: Map<number, number>;
};

/** Hidden copy id -> machine id, following chains (a copy of a page that was itself merged). */
function chain(into: Map<number, number>) {
  for (const [from, to] of into) {
    let end = to;
    for (let n = 0; into.has(end) && n < 10; n++) end = into.get(end)!;
    into.set(from, end);
  }
  return into;
}
const merged = (products: Doc[]) =>
  chain(new Map(products.filter((p) => relId(p.mergedInto) != null).map((p) => [p.id, relId(p.mergedInto)!])));

function plan(products: Doc[]): Plan {
  const active = products.filter(listed);
  const buyOnly = active.filter((p) => p.forSale && !p.forRent);
  const rentOnly = active.filter((p) => p.forRent && !p.forSale);
  const groups = new Map<string, Doc[]>();
  for (const p of [...buyOnly, ...rentOnly]) {
    const k = p.modelNo?.trim() ? modelKey(p.modelNo) : "";
    if (k) groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const pairs: Plan["pairs"] = [];
  const copies: Plan["copies"] = [];
  const unclear: string[] = [];
  const used = new Set<number>();
  const isCopy = (p: Doc) => /-copy(-\d+)?$/.test(p.slug);

  for (const [k, group] of groups) {
    const buys = group.filter((p) => p.forSale && !isCopy(p));
    const rents = group.filter((p) => p.forRent);
    if (buys.length === 1 && rents.length === 1) {
      pairs.push({ buy: buys[0], rent: rents[0] });
      used.add(buys[0].id).add(rents[0].id);
    } else if (rents.length && buys.length > 1) {
      unclear.push(`${k}: ${buys.length} buy and ${rents.length} rent pages (${group.map((p) => p.slug).join(", ")})`);
    } else if (rents.length > 1) {
      unclear.push(`${k}: ${rents.length} rent pages (${group.map((p) => p.slug).join(", ")})`);
    }
  }
  // Without a model number: "x" and "x-rent".
  const bySlug = new Map(buyOnly.map((p) => [p.slug, p]));
  for (const r of rentOnly) {
    if (used.has(r.id) || r.modelNo?.trim() || !r.slug.endsWith("-rent")) continue;
    const b = bySlug.get(r.slug.slice(0, -"-rent".length));
    if (b && !used.has(b.id) && !b.modelNo?.trim()) {
      pairs.push({ buy: b, rent: r });
      used.add(b.id).add(r.id);
    }
  }
  // "(Copy)" duplicates of a buy page: the original is the listed product with the slug minus "-copy".
  const bySlugAll = new Map(active.map((p) => [p.slug, p]));
  for (const c of active.filter((p) => isCopy(p) && p.forSale && !p.forRent)) {
    const main = bySlugAll.get(c.slug.replace(/-copy(-\d+)?$/, ""));
    if (main && main.id !== c.id) copies.push({ main, copy: c });
  }

  const into = merged(products);
  for (const { buy, rent } of pairs) into.set(rent.id, buy.id);
  for (const { main, copy } of copies) into.set(copy.id, main.id);
  return { pairs, copies, unclear, into: chain(into) };
}

/** Relationship ids with hidden copies replaced by their machine, without repeats or `self`. */
function remap(ids: Rel[] | null | undefined, into: Map<number, number>, self?: number) {
  const out: number[] = [];
  for (const v of ids ?? []) {
    const id = relId(v);
    if (id == null) continue;
    const to = into.get(id) ?? id;
    if (to !== self && !out.includes(to)) out.push(to);
  }
  return out;
}
const sameIds = (a: Rel[] | null | undefined, b: number[]) => {
  const x = (a ?? []).map(relId);
  return x.length === b.length && x.every((v, i) => v === b[i]);
};

/** What the buy product gets from its rent copy: the fields it has empty. */
function fills(buy: Doc, rent: Doc): { data: Row; names: string[] } {
  const data: Row = {};
  const names: string[] = [];
  for (const f of FILL) {
    if (empty(buy[f]) && !empty(rent[f])) {
      data[f] = fresh(rent[f]);
      names.push(f);
    }
  }
  const facets = { ...(buy.facets ?? {}) };
  for (const [k, v] of Object.entries(rent.facets ?? {})) {
    if (empty(facets[k]) && !empty(v)) {
      facets[k] = v;
      names.push(`facets.${k}`);
    }
  }
  if (names.some((n) => n.startsWith("facets."))) data.facets = facets;
  const meta = { ...(buy.meta ?? {}) };
  for (const k of ["title", "description", "image"] as const) {
    if (empty(meta[k]) && !empty(rent.meta?.[k])) {
      (meta as Row)[k] = rent.meta![k];
      names.push(`meta.${k}`);
    }
  }
  if (names.some((n) => n.startsWith("meta."))) data.meta = meta;
  return { data, names };
}

/**
 * Products saved with only the old buy-or-rent field (say, added in the admin between the database
 * update and the code update) count as available that way. Run for real, the merge ticks it.
 */
const unticked = (p: Doc) => !!p.mode && p.forSale == null && p.forRent == null && relId(p.mergedInto) == null;

async function load(payload: Payload) {
  const all = <T>(collection: "products" | "product-listings") =>
    payload.find({ collection, limit: 0, pagination: false, depth: 0 }).then((r) => r.docs as unknown as T[]);
  const [docs, listings] = await Promise.all([all<Doc>("products"), all<Listing>("product-listings")]);
  const untick = docs.filter(unticked);
  const products = docs.map((p) => (unticked(p) ? { ...p, forSale: p.mode === "buy", forRent: p.mode === "rent" } : p));
  return { products, listings, untick, plan: plan(products) };
}

/** Merge one machine (or fold one duplicate) in a transaction: both writes or neither. */
async function mergeOne(payload: Payload, keepId: number, dropId: number, into: Map<number, number>, rent: boolean) {
  const req = await createLocalReq({}, payload);
  await initTransaction(req);
  try {
    // As they are now: an earlier merge on this run may have changed the machine.
    const read = (id: number) => payload.findByID({ collection: "products", id, depth: 0, req }) as unknown as Promise<Doc>;
    const [keep, drop] = await Promise.all([read(keepId), read(dropId)]);
    const { data, names } = fills(keep, drop);
    const former = [
      ...(keep.formerSlugs ?? []),
      { slug: drop.slug, rent },
      ...(drop.formerSlugs ?? []).map((f) => ({ slug: f.slug, rent: rent || !!f.rent })),
    ];
    await payload.update({
      collection: "products",
      id: keep.id,
      data: {
        ...data,
        // Related products may list copies hidden by this merge: point them at the machines.
        related: remap((data.related as Rel[] | undefined) ?? keep.related, into, keep.id),
        forSale: true,
        forRent: !!(keep.forRent || drop.forRent),
        formerSlugs: former.map(({ slug, rent }) => ({ slug, rent })),
      } as never,
      depth: 0,
      req,
    });
    await payload.update({
      collection: "products",
      id: drop.id,
      data: { forSale: false, forRent: false, mergedInto: keep.id, related: remap(drop.related, into, drop.id) } as never,
      depth: 0,
      req,
    });
    await commitTransaction(req);
    return names;
  } catch (err) {
    await killTransaction(req);
    throw err;
  }
}

function describe({ pairs, copies, unclear }: Plan, say: (l: string) => void, verb: string) {
  say(`${pairs.length} machines with a separate buy and rent page ${verb}, ${copies.length} duplicate page(s).`);
  if (unclear.length) {
    say(`${unclear.length} model number(s) left alone (check by hand):`);
    unclear.forEach((u) => say(`  ? ${u}`));
  }
}

/** Re-points related products and listings that still list a hidden copy. Returns false when out of time. */
async function repoint({ payload, deadline, log }: ImportContext, products: Doc[], listings: Listing[]) {
  const into = merged(products);
  let n = 0;
  for (const p of products.filter(listed)) {
    const related = remap(p.related, into, p.id);
    if (sameIds(p.related, related)) continue;
    if (Date.now() > deadline) return false;
    await payload.update({ collection: "products", id: p.id, data: { related } as never, depth: 0 });
    n++;
  }
  for (const l of listings) {
    const ids = remap(l.products, into);
    if (sameIds(l.products, ids)) continue;
    if (Date.now() > deadline) return false;
    await payload.update({ collection: "product-listings", id: l.id, data: { products: ids } as never, depth: 0 });
    n++;
  }
  if (n) log(`Re-pointed related products and listings on ${n} page(s) to the merged machines.`);
  return true;
}

export const mergePreviewTask: ImportTask = {
  key: "merge-buy-rent-preview",
  label: "Buy & rent merge: preview (changes nothing)",
  async run({ payload, log }) {
    const { products, listings, untick, plan: p } = await load(payload);
    if (untick.length) log(`${untick.length} product(s) saved with only the old buy-or-rent field would get Available to buy/rent ticked.`);
    describe(p, log, "would become one page each");
    for (const { buy, rent } of p.pairs) {
      const { names } = fills(buy, rent);
      log(`  ${buy.slug}  <-  ${rent.slug}${names.length ? `  (fills ${names.join(", ")})` : ""}`);
    }
    for (const { main, copy } of p.copies) log(`  ${main.slug}  <-  ${copy.slug}  (duplicate)`);
    const pages = products.filter((x) => listed(x) && !sameIds(x.related, remap(x.related, p.into, x.id))).length;
    const lists = listings.filter((l) => !sameIds(l.products, remap(l.products, p.into))).length;
    log(`Related products would be re-pointed on ${pages} product(s), product lists on ${lists} listing(s).`);
    return null;
  },
};

export const mergeTask: ImportTask = {
  key: "merge-buy-rent",
  label: "Buy & rent merge: one page per machine (run the preview first)",
  async run(ctx) {
    const { payload, deadline, log } = ctx;
    let { products, listings, untick, plan: p } = await load(payload);
    if (untick.length) {
      for (const u of untick) {
        await payload.update({ collection: "products", id: u.id, data: { forSale: u.mode === "buy", forRent: u.mode === "rent" } as never, depth: 0 });
      }
      log(`Ticked Available to buy/rent on ${untick.length} product(s) saved with only the old buy-or-rent field.`);
      ({ products, listings, untick, plan: p } = await load(payload));
    }
    describe(p, log, "to merge");
    let failed = 0;
    for (const [keep, drop, rent] of [
      ...p.pairs.map(({ buy, rent }) => [buy, rent, true] as const),
      ...p.copies.map(({ main, copy }) => [main, copy, false] as const),
    ]) {
      if (Date.now() > deadline) return 1;
      try {
        const names = await mergeOne(payload, keep.id, drop.id, p.into, rent);
        log(`  merged ${drop.slug} into ${keep.slug}${names.length ? ` (filled ${names.join(", ")})` : ""}`);
      } catch (err) {
        failed++;
        p.into.delete(drop.id);
        log(`! ${keep.slug} + ${drop.slug}: not merged (${(err as Error).message.split("\n")[0]})`);
      }
    }
    // Copies merged on this run are hidden now: read again, then fix what still points at them.
    const after = p.pairs.length || p.copies.length ? await load(payload) : { products, listings };
    if (!(await repoint(ctx, after.products, after.listings))) return 1;
    log(failed ? `Done, with ${failed} machine(s) not merged (see above).` : "Done.");
    return null;
  },
};

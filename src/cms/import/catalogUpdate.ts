/**
 * October 2026 catalogue update (from "Priority Product Listing for MTandT.com"):
 * - add the listed aerial work platforms (buy and rent, named "<Type> – <Model>"),
 * - rename existing products that are the same machine under an older model name,
 * - remove supplier names from product titles, copy, SEO text and addresses.
 *
 * Pure data and string helpers (no Payload imports), shared by the CMS import task
 * (tasks/catalogUpdate.ts) and the script that applies the same changes to the scraped
 * fallback catalogue (migration/apply-catalog-update.mts), so both stay identical.
 */

export type RangeSlug = "boom-lift" | "scissor-lift" | "vertical-lift" | "spider-lift";

export type NewModel = { model: string; type: string; subcategory: RangeSlug };

const group = (type: string, subcategory: RangeSlug, models: string[]): NewModel[] =>
  models.map((model) => ({ model, type, subcategory }));

/** New models (models already on the site, or renamed from an older name, are not here). */
export const NEW_MODELS: NewModel[] = [
  ...group("Telescopic Boom Lift", "boom-lift", ["MDT16RT", "MST60J"]),
  ...group("Articulated Boom Lift", "boom-lift", [
    "MDA16RT",
    "MDA16ERT",
    "MDA18RT",
    "MDA24ERT",
    "MDA28RT",
    "MDA41RT",
    "MDA44RT",
    "MRA56",
    "MSA16EJ",
    "MSA18EJ",
    "MSA48DJ",
  ]),
  ...group("Electric Articulated Boom Lift", "boom-lift", ["MDA16NE", "MDA18NE"]),
  ...group("Crawler Boom Lift", "boom-lift", ["MGCL24", "MGCL26"]),
  ...group("Scissor Lift", "scissor-lift", [
    "MDXS08EN",
    "MDXS10EN",
    "MDXS10EW",
    "MDXS12EW",
    "MDXS14E",
    "MDXS16EN",
    "MDX05EM",
    "MDX14DW",
    "MDX18ERT",
    "MDX28DN",
    "MDX28EHD",
    "MDX32EHD",
    "MSX10E",
    "MSX10EW",
    "MSX12E",
    "MSX16E",
  ]),
  ...group("Rough Terrain Scissor Lift", "scissor-lift", ["MSX18RE"]),
  ...group("Mast Boom Lift", "vertical-lift", ["MDMB13-9200", "MSMB10EJ"]),
  ...group("Hybrid Articulated Spider Lift", "spider-lift", ["MECL31AH"]),
  ...group("Hybrid Telescopic Spider Lift", "spider-lift", ["MECL420TH"]),
  ...group("Electric Articulated Spider Lift", "spider-lift", ["MECL21EA", "MECL26EA", "MECL31EA"]),
];

/**
 * Existing products that are the same machine as a listed model under an older model name:
 * keep the product (specs, photos, ranking) and give it the new model name.
 */
export const RENAMED_MODELS: Record<string, string> = {
  "GTWY9.5-1300": "MDVL9.5-1300",
  "GTWY11-1300": "MDVL11-1300",
  "GTWY12.5-2100": "MDVL12.5-2100",
  "GTWY14-2100": "MDVL14-2100",
  "AMWP8-1200": "MDMB8-1200",
  "AWMP11.5-8100": "MDMB11.5-8200AC",
  BA24RT: "MDA24RT",
  BT24RT: "MDT24RT",
};

const RANGE_NAMES: Record<string, string> = {
  "boom-lift": "Boom Lift",
  "scissor-lift": "Scissor Lift",
  "vertical-lift": "Lift",
  "spider-lift": "Spider Lift",
};

// Supplier names to keep off the site ("MLIFT" is our own brand but stays out of titles).
const SUPPLIER = /\b(?:dingli|sino\s*boom|run\s*share|goman|easy\s*-?\s*lift)\b/i;

export const mentionsSupplier = (s: string | null | undefined) => !!s && SUPPLIER.test(s);

/** Remove supplier names from running text (descriptions, SEO text). */
export function stripSupplier(text: string): string {
  if (!mentionsSupplier(text)) return text;
  let out = text
    .replace(new RegExp(`(^|[.!?>]\\s*)${SUPPLIER.source}'s\\s+(\\w)`, "gi"), (_m, pre, c) => `${pre}${c.toUpperCase()}`)
    .replace(new RegExp(`${SUPPLIER.source}'s\\s+`, "gi"), "")
    .replace(new RegExp(`\\s+(?:by|from)\\s+${SUPPLIER.source}`, "gi"), "")
    .replace(new RegExp(`\\s*[-–]\\s*${SUPPLIER.source}\\s*[-–]\\s*`, "gi"), " - ")
    .replace(new RegExp(`${SUPPLIER.source}\\s*[-–]\\s*`, "gi"), "")
    .replace(new RegExp(`\\s*[-–]\\s*${SUPPLIER.source}`, "gi"), "")
    .replace(new RegExp(`${SUPPLIER.source}\\s*`, "gi"), "");
  out = out.replace(/ {2,}/g, " ").replace(/\(\s*\)/g, "").replace(/\s+([,.])/g, "$1");
  return out;
}

const isModelToken = (w: string) => /\d/.test(w) && /[a-z]/i.test(w);
const SMALL = new Set(["and", "or", "for", "of", "with", "to", "in", "on", "the", "a"]);
const ACRONYMS = new Set(["RT", "AC", "DC", "HD", "MHE", "AWP"]);

/** "SELF PROPELLED ELECTRIC" -> "Self Propelled Electric" (model codes stay as they are). */
function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((w, i) => {
      if (/^\s+$|^-$/.test(w) || !w) return w;
      const orig = s.split(/(\s+|-)/)[i] ?? w;
      if (isModelToken(orig) || ACRONYMS.has(orig.toUpperCase())) return orig.toUpperCase();
      if (i > 0 && SMALL.has(w)) return w;
      return w[0].toUpperCase() + w.slice(1);
    })
    .join("");
}

const normModel = (m: string) => m.replace(/\s*-\s*/g, "-").trim();

/**
 * Product title as "<Type> – <Model>", for titles that name a supplier or are all caps,
 * e.g. "SELF PROPELLED ELECTRIC - DINGLI -JCPT0812HA" -> "Self Propelled Electric Scissor
 * Lift – JCPT0812HA". Other titles are returned unchanged.
 */
export function tidyTitle(title: string, model: string | null | undefined, subcategory: string | null | undefined): string {
  const caps = title === title.toUpperCase() && /[A-Z]{3}/.test(title);
  if (!mentionsSupplier(title) && !/\bm\s?lift\b\s*-/i.test(title) && !caps) return title;
  const m = model ? normModel(model) : null;
  let base = stripSupplier(title).replace(/\bm\s?lift\b/gi, "");
  if (m) base = base.replace(new RegExp(m.replace(/[.*+?^${}()|[\]\\-]/g, "[\\s-]*"), "i"), "");
  base = base.replace(/[\s\-–]+$/g, "").replace(/^[\s\-–]+/g, "").replace(/\s*-\s*-\s*/g, " - ").replace(/\s{2,}/g, " ");
  const range = subcategory ? RANGE_NAMES[subcategory] : null;
  if (range && !new RegExp(range.replace(" ", "\\s*"), "i").test(base)) base = `${base} ${range}`;
  base = titleCase(base.replace(/\s*-\s*$/, ""));
  return m ? `${base} – ${m}` : base;
}

/**
 * Consistent wording: "Self Propelled" -> "Self-Propelled", "Push Around" -> "Push-Around",
 * a trailing " - Electric" qualifier -> " (Electric)", and a "-Copy" marker kept visible.
 */
export function polishTitle(title: string): string {
  let t = title
    .replace(/\bself[\s-]+propelled\b/gi, "Self-Propelled")
    .replace(/\bpush[\s-]+around\b/gi, "Push-Around");
  let copy = false;
  t = t.replace(/\s*-\s*copy\b/i, () => ((copy = true), ""));
  const [base, model] = t.split(" – ");
  const qualified = base.replace(/\s+-\s+(electric|diesel|wheel|crawler|hybrid)$/i, " ($1)");
  return `${qualified}${model ? ` – ${model}` : ""}${copy ? " (Copy)" : ""}`;
}

/** URL slug for a title (and "-rent" for the rental copy). */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const newModelSlug = (n: NewModel, mode: "buy" | "rent") =>
  `${slugify(`${n.type} ${n.model}`)}${mode === "rent" ? "-rent" : ""}`;

export const newModelTitle = (n: NewModel) => `${n.type} – ${n.model}`;

/** Replace a renamed model's old name in text ("BA24RT" -> "MDA24RT"). */
export function renameModelIn(text: string, from: string, to: string): string {
  const pattern = new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/-/g, "\\s*-\\s*")}\\b`, "gi");
  return text.replace(pattern, to);
}

/**
 * New slug for a product whose slug names a supplier or a renamed model, or null to keep it.
 * Applied the same way to the CMS and the fallback catalogue, so redirects line up.
 */
export function renamedSlug(slug: string, model: string | null | undefined): string | null {
  let out = slug;
  if (/(^|-)dingli(-|$)/.test(out)) {
    out = out.replace(/(^|-)dingli(?=-|$)/, "");
    if (model && !out.includes(slugify(model))) out = `${out}-${slugify(model)}`;
    out = out.replace(/^(self-propelled|push-around)-((?:rough-terrain-|rt-)?(?:electric|diesel))-(?!scissor)/, "$1-$2-scissor-lift-");
  }
  for (const [from, to] of Object.entries(RENAMED_MODELS)) {
    if (out.includes(slugify(from))) out = out.replace(slugify(from), slugify(to));
  }
  out = out.replace(/-{2,}/g, "-").replace(/^-|-$/g, "");
  return out === slug ? null : out;
}

/**
 * The full rule for an existing product's title and model: renamed model names, supplier
 * names removed, consistent wording. Titles that need none of this come back unchanged.
 */
export function updatedProduct(
  title: string,
  model: string | null | undefined,
  subcategory: string | null | undefined,
): { title: string; model: string | null } {
  const renamed = model ? RENAMED_MODELS[normModel(model)] : undefined;
  let t = title;
  if (renamed && model) {
    t = renameModelIn(t, model, renamed);
    if (!t.includes(renamed)) t = `${tidyTitle(t, null, subcategory)} – ${renamed}`;
  }
  t = tidyTitle(t, renamed ?? model, subcategory);
  if (t !== title) t = polishTitle(t);
  return { title: t, model: renamed ?? model ?? null };
}

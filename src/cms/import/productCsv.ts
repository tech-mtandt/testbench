/**
 * Product CSV import (admin > Products > "Import products from CSV"): reading and checking the
 * file. Pure, no Payload imports; productCsvRun.ts does the database side.
 *
 * One row per model. Known columns are below; every other column is a specification
 * (header = label, cell = value), in column order. The first two specification columns also
 * show on listing cards next to the model number.
 */
import { RENAMED_MODELS, mentionsSupplier, slugify, stripSupplier } from "./catalogUpdate";

export type Mode = "buy" | "rent";

/** A range (subcategory) products can be listed under. */
export type Range = { key: string; name: string; categoryId: number; categorySlug: string; subSlug: string };

export type CsvRow = {
  line: number;
  model: string;
  range: Range | null;
  type: string;
  title: string;
  modes: Mode[];
  description: string;
  applications: string[];
  seoTitle: string;
  seoDescription: string;
  specs: [string, string][];
  /** Only the columns this row has values for are written when a product is updated. */
  has: { title: boolean; modes: boolean; description: boolean; applications: boolean; seo: boolean; specs: boolean };
  errors: string[];
  warnings: string[];
};

/** Recognised headers (lowercased, punctuation removed) for the non-specification columns. */
const COLUMNS: Record<string, string[]> = {
  model: ["model no", "model", "model number", "model no."],
  range: ["range", "subcategory", "product range"],
  type: ["type", "product type"],
  title: ["title", "product name", "name"],
  modes: ["buy or rent", "buy/rent", "mode", "available for"],
  description: ["description"],
  applications: ["applications"],
  seoTitle: ["seo title", "meta title"],
  seoDescription: ["seo description", "meta description"],
};

export const TEMPLATE_HEADERS = [
  "Model No",
  "Range",
  "Type",
  "Buy or Rent",
  "Working Height (m)",
  "Platform Height (m)",
  "Platform Capacity (kg)",
  "Machine Weight (kg)",
  "Description",
  "Applications",
];
const TEMPLATE_EXAMPLE = [
  "EXAMPLE-21",
  "Spider Lift",
  "Electric Articulated Spider Lift",
  "Both",
  "21",
  "19",
  "230",
  "2900",
  "Compact tracked spider lift for indoor and outdoor work at height.",
  "Facade maintenance; Tree care; Warehouses",
];

const cell = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
/** The template: headers and one example row (rows whose model starts with EXAMPLE are skipped). */
export const TEMPLATE_CSV = [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";

export const MAX_ROWS = 500;

/** RFC 4180 CSV (quoted fields, "" escapes, line breaks in quotes); comma, semicolon or tab. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = [",", ";", "\t"].reduce((best, d) => (firstLine.split(d).length > firstLine.split(best).length ? d : best), ",");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"' && field === "") quoted = true;
    else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const headerKey = (h: string) => h.toLowerCase().replace(/[^a-z0-9/ .]/g, "").replace(/\s+/g, " ").trim();

/** Model numbers compare without case, spaces or dashes ("MDMB13 9200" = "mdmb13-9200"). */
export const modelKey = (m: string) => m.toUpperCase().replace(/[\s-]+/g, "");

const RENAMED = new Map(Object.entries(RENAMED_MODELS).map(([from, to]) => [modelKey(from), to]));

/** "Spider Lift", "spider lifts", "spider-lift" -> one key. */
export const rangeKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/s$/, "")
    .replace(/ /g, "-");

/**
 * A range's display name, also the default product type in titles: title case and singular, from
 * the slug when the CMS name is one ("Spider lift" -> "Spider Lift", "porta-pad" -> "Porta Pad",
 * "Battery Power Stations" -> "Battery Power Station"). Words with capitals inside stay ("PortaDeck").
 */
export function rangeName(name: string, slug: string) {
  const src = !name.trim() || name.trim() === slug ? slug.replace(/-/g, " ") : name.trim();
  const words = src.split(/\s+/).map((w) => (/[A-Z]/.test(w.slice(1)) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase()));
  const last = words.length - 1;
  if (/[^s]s$/i.test(words[last]) && !/series$/i.test(words[last])) words[last] = words[last].slice(0, -1);
  return words.join(" ");
}

/** "23 m", "23.5", "2,865 kg" -> number; null when there is no number. */
export const parseNumber = (v: string) => {
  const m = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
};

/** Header -> listing-card label: units in brackets dropped ("Working Height (m)" -> "Working Height"). */
export const cardLabel = (h: string) => h.replace(/\s*\([^)]*\)\s*$/, "").trim();

/** Sort/filter numbers the listing pages use, from the matching specification columns. */
export const SORT_FIELDS: [RegExp, "workingHeight" | "machineWeight" | "maxLiftingCapacity" | "maxLiftingHeight"][] = [
  [/working\s*height/i, "workingHeight"],
  [/machine\s*weight|\bweight\b/i, "machineWeight"],
  [/(max\.?\s*)?lifting\s*capacity/i, "maxLiftingCapacity"],
  [/(max\.?\s*)?lifting\s*height/i, "maxLiftingHeight"],
];

/** Read the file into checked rows. `ranges` are the subcategories on the site. */
export function readCsv(text: string, ranges: Range[], defaultRange?: string | null): { rows: CsvRow[]; errors: string[] } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], errors: ["The file has no product rows (the first row must be the column headings)."] };
  const [header, ...body] = table;
  if (body.length > MAX_ROWS) return { rows: [], errors: [`The file has ${body.length} rows; import at most ${MAX_ROWS} at a time.`] };

  const role = header.map((h) => Object.entries(COLUMNS).find(([, names]) => names.includes(headerKey(h)))?.[0] ?? (h.trim() ? "spec" : "skip"));
  if (!role.includes("model")) return { rows: [], errors: ['No "Model No" column found. Use the template headings.'] };
  const byKey = new Map(ranges.map((r) => [r.key, r]));
  const fallback = defaultRange ? (byKey.get(rangeKey(defaultRange)) ?? null) : null;
  if (!role.includes("range") && !fallback)
    return { rows: [], errors: ['No "Range" column: add one, or choose the range for this file above.'] };

  const seen = new Map<string, number>();
  const rows = body.map((cells, i): CsvRow => {
    const line = i + 2;
    const errors: string[] = [];
    const warnings: string[] = [];
    const get = (r: string) => {
      const j = role.indexOf(r);
      return j >= 0 ? (cells[j] ?? "").trim() : "";
    };
    // Supplier names never reach the site.
    const clean = (v: string, what: string) => {
      if (!mentionsSupplier(v)) return v;
      warnings.push(`supplier name removed from ${what}`);
      return stripSupplier(v).trim();
    };

    let model = clean(get("model"), "the model number").replace(/\s+/g, " ");
    if (model && RENAMED.has(modelKey(model))) {
      const to = RENAMED.get(modelKey(model))!;
      warnings.push(`${model} is now called ${to}; using ${to}`);
      model = to;
    }
    const rangeIn = get("range");
    const range = rangeIn ? (byKey.get(rangeKey(rangeIn)) ?? null) : fallback;
    if (!model) errors.push("no model number");
    if (!range) errors.push(rangeIn ? `unknown range "${rangeIn}"` : "no range");
    if (model) {
      const k = modelKey(model);
      if (seen.has(k)) errors.push(`same model as line ${seen.get(k)}`);
      else seen.set(k, line);
    }
    if (/^example/i.test(model)) errors.push("example row from the template, not imported");

    const modesIn = get("modes").toLowerCase();
    const modes: Mode[] = !modesIn || /both|buy.*rent|rent.*buy|all/.test(modesIn) ? ["buy", "rent"] : /rent|hire/.test(modesIn) ? ["rent"] : /buy|sale|sell/.test(modesIn) ? ["buy"] : [];
    if (!modes.length) errors.push(`"Buy or Rent" should be Buy, Rent or Both (got "${get("modes")}")`);

    const type = clean(get("type"), "the type") || range?.name || "";
    const titleIn = clean(get("title"), "the title");
    const specs: [string, string][] = [];
    header.forEach((h, j) => {
      const v = (cells[j] ?? "").trim();
      if (role[j] === "spec" && v) specs.push([h.trim(), clean(v, h.trim())]);
    });
    const description = clean(get("description"), "the description");
    const applications = clean(get("applications"), "the applications")
      .split(/[;\n|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seoTitle = clean(get("seoTitle"), "the SEO title");
    const seoDescription = clean(get("seoDescription"), "the SEO description");
    return {
      line,
      model,
      range,
      type,
      title: titleIn || (model && type ? `${type} – ${model}` : model),
      modes,
      description,
      applications,
      seoTitle,
      seoDescription,
      specs,
      has: {
        title: !!(titleIn || get("type")),
        modes: !!modesIn,
        description: !!description,
        applications: applications.length > 0,
        seo: !!(seoTitle || seoDescription),
        specs: specs.length > 0,
      },
      errors,
      warnings: [...new Set(warnings)],
    };
  });
  return { rows, errors: [] };
}

/** Address of a new product: "<type> <model>" (one page per machine, for sale and/or hire). */
export const newSlug = (row: Pick<CsvRow, "type" | "model">) => slugify(`${row.type} ${row.model}`);

/** Specification rows: Model No first, then the file's columns. */
export const specRows = (row: CsvRow) => [["Model No", row.model] as [string, string], ...row.specs];

/** Listing card: Model No plus the first two specification columns. */
export const cardRows = (row: CsvRow) => [["Model No", row.model] as [string, string], ...row.specs.slice(0, 2).map(([k, v]) => [cardLabel(k), v] as [string, string])];

/** Sort/filter numbers from the specification columns. */
export function sortValues(row: CsvRow) {
  const out: Partial<Record<(typeof SORT_FIELDS)[number][1], number>> = {};
  for (const [label, value] of row.specs) {
    const hit = SORT_FIELDS.find(([re]) => re.test(label));
    const n = parseNumber(value);
    if (hit && n !== null && out[hit[1]] === undefined) out[hit[1]] = n;
  }
  return out;
}

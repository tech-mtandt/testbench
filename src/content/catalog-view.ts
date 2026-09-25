/**
 * Server-side view models for the equipment catalog: slim card props, URL filter
 * parsing, faceting, search, spec formatting, legacy-URL resolution and HTML cleanup.
 * Never import this (or catalog.ts) from a client component — pass `CardData` instead.
 */
import {
  catalog,
  catalogCategories,
  categoryShort,
  getItemByLegacySlug,
  productHref,
  type CatalogItem,
  type Mode,
} from "@/content/catalog";
import { categoryAlias, facetNames, getCategory, type FacetKey } from "@/content/products";
import { categoryAliases } from "@/content/custom";

// ------------------------------------------------------------------ specs

const UNIT = /^(m|mm|cm|mtr|mtrs|meter|meters|metre|metres|kg|kgs|ton|tons|t|kw|kva|v|w|hp|lbs|sq\.?\s?m|m2|l|ltr|hrs?|mah|ah|°)$/i;

export type Spec = { label: string; value: string };

/** "Platform Height (m)" + "13" → { label: "Platform Height", value: "13 m" } */
export function fmtSpec([rawLabel, rawValue]: [string, string]): Spec {
  let label = rawLabel.replace(/\s+/g, " ").replace(/[:\s]+$/, "").trim();
  let unit = "";
  const paren = label.match(/\s*\(([^)]+)\)\s*$/);
  const inUnit = label.match(/\s+in\s+([a-z.²]+)\s*$/i);
  const m = paren && UNIT.test(paren[1].trim()) ? paren : inUnit && UNIT.test(inUnit[1]) ? inUnit : null;
  if (m) {
    unit = m[1].trim();
    label = label.slice(0, m.index).trim();
  }
  if (!unit && /working height|platform height|outreach|reach|lifting height/i.test(label)) unit = "m";
  unit = unit.toLowerCase().replace(/^(mtrs?|meters?|metres?)$/, "m").replace(/^kgs$/, "kg");
  let value = rawValue.replace(/\s+/g, " ").trim();
  if (unit && /^[\d.,\s/x×-]+$/i.test(value)) value = `${value} ${unit}`;
  return { label, value };
}

/** Key used to align spec rows across products (compare). */
export const specKey = (label: string) => fmtSpec([label, ""]).label.toLowerCase().replace(/[^a-z0-9]/g, "");

// ------------------------------------------------------------------ cards

export type CardData = {
  slug: string;
  href: string;
  kind: CatalogItem["kind"];
  title: string;
  model: string;
  image: string | null;
  category: string;
  categoryName: string;
  subcategoryName: string;
  modes: Mode[];
  specs: Spec[];
  summary: string;
};

export const toCard = (it: CatalogItem): CardData => ({
  slug: it.slug,
  href: productHref(it),
  kind: it.kind,
  title: it.title,
  model: it.model,
  image: it.image,
  category: it.category,
  categoryName: categoryShort[it.category] ?? it.categoryName,
  subcategoryName: it.subcategoryName,
  modes: it.modes,
  specs: it.keySpecs.map(fmtSpec).slice(0, 3),
  summary: it.kind === "system" ? it.summary : "",
});

export const categoryLabel = (slug: string) => categoryShort[slug] ?? getCategory(slug)?.title ?? slug;
export const isSystemCategory = (slug: string) => catalog.some((i) => i.category === slug && i.kind === "system");

// ------------------------------------------------------------------ filters

export type Sort = "relevance" | "height-asc" | "height-desc" | "name";
export const SORTS: { value: Sort; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "height-asc", label: "Working height ↑" },
  { value: "height-desc", label: "Working height ↓" },
  { value: "name", label: "Name A–Z" },
];

type FacetParam = "type" | "power" | "brand" | "condition" | "country";
export const FACET_GROUPS: { param: FacetParam; facet: FacetKey; label: string }[] = [
  { param: "type", facet: "primaryType", label: "Type" },
  { param: "power", facet: "powerType", label: "Power source" },
  { param: "brand", facet: "brand", label: "Brand" },
  { param: "condition", facet: "condition", label: "Condition" },
  { param: "country", facet: "country", label: "Available in" },
];

export const HEIGHTS = [
  { id: "0-10", label: "Up to 10 m", min: 0, max: 10 },
  { id: "10-20", label: "10 – 20 m", min: 10, max: 20 },
  { id: "20-30", label: "20 – 30 m", min: 20, max: 30 },
  { id: "30-", label: "30 m and above", min: 30, max: Infinity },
];

export type Filters = {
  q: string;
  mode: Mode | null;
  category: string | null;
  sub: string | null;
  facets: Record<FacetParam, string[]>;
  h: string | null;
  sort: Sort;
  show: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || null;
const many = (v: string | string[] | undefined) =>
  [v]
    .flat()
    .flatMap((s) => (s ?? "").split(","))
    .map((s) => s.trim())
    .filter(Boolean);

export const PAGE = 36;

export function parseFilters(sp: SearchParams, scope: { category?: string } = {}): Filters {
  const mode = one(sp.mode);
  const sort = one(sp.sort) as Sort | null;
  const h = one(sp.h);
  return {
    q: (one(sp.q) ?? "").slice(0, 120),
    mode: mode === "buy" || mode === "rent" ? mode : null,
    category: scope.category ?? (getCategory(one(sp.category) ?? "") ? one(sp.category) : null),
    sub: one(sp.sub),
    facets: Object.fromEntries(FACET_GROUPS.map((g) => [g.param, many(sp[g.param])])) as Filters["facets"],
    h: HEIGHTS.some((x) => x.id === h) ? h : null,
    sort: sort && SORTS.some((s) => s.value === sort) ? sort : "relevance",
    show: Math.max(PAGE, Math.min(500, Number(one(sp.show)) || PAGE)),
  };
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const facetLabel = (facet: FacetKey, id: string) => facetNames[facet]?.[id] ?? id;
/** Facet values for an item as URL-safe label slugs (IDs duplicate labels in the source data). */
function facetValues(it: CatalogItem, facet: FacetKey) {
  return [...new Set((it.facets[facet] ?? []).map((id) => facetLabel(facet, id)).filter((l) => l && !/^\d+$|^a$/.test(l)))];
}
const facetLabelsById = new Map<string, string>();
for (const g of FACET_GROUPS)
  for (const label of Object.values(facetNames[g.facet] ?? {})) facetLabelsById.set(`${g.param}:${slugify(label)}`, label);

const height = (it: CatalogItem) => it.num.working_height ?? null;

// search ---------------------------------------------------------------

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/aluminum/g, "aluminium")
    .replace(/scaffold(ing)?s?/g, "scaffold")
    .replace(/[^a-z0-9.]+/g, " ")
    .replace(/(?<!\d)\.|\.(?!\d)/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hay = new Map<string, { title: string; group: string; rest: string }>();
for (const it of catalog) {
  const facetText = FACET_GROUPS.flatMap((g) => facetValues(it, g.facet)).join(" ");
  hay.set(it.slug, {
    title: fold(`${it.title} ${it.model}`),
    group: fold(`${it.subcategoryName} ${it.categoryName} ${categoryShort[it.category] ?? ""}`),
    rest: fold(`${facetText} ${it.specs.map((s) => s[1]).join(" ")} ${it.summary} ${it.legacySlugs.join(" ")}`),
  });
}
const stem = (w: string) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
const compact = (s: string) => s.replace(/ /g, "");

function searchScores(q: string) {
  const hm = q.match(/(\d+(?:\.\d+)?)\s*(?:m|mtrs?|meters?|metres?)\b/i);
  const target = hm ? Number(hm[1]) : null;
  const words = fold(hm ? q.replace(hm[0], " ") : q)
    .split(" ")
    .filter((w) => w && !/^(for|the|and|a|an|of|in|with|to|on)$/.test(w))
    .map(stem);
  const scores = new Map<string, { hits: number; score: number }>();
  for (const it of catalog) {
    const h = hay.get(it.slug)!;
    let hits = 0;
    let score = 0;
    for (const w of words) {
      const inTitle = h.title.includes(w) || compact(h.title).includes(w);
      const inGroup = h.group.includes(w);
      if (inTitle || inGroup || h.rest.includes(w)) hits++;
      score += inTitle ? 4 : inGroup ? 3 : h.rest.includes(w) ? 1 : 0;
    }
    if (target !== null) {
      const wh = height(it);
      if (wh === null || Math.abs(wh - target) > Math.max(2, target * 0.15)) continue;
      score += 6 - Math.min(5, Math.abs(wh - target));
    }
    if (words.length && !hits) continue;
    scores.set(it.slug, { hits, score });
  }
  const need = words.length;
  const strict = [...scores].filter(([, s]) => s.hits >= need);
  if (strict.length || !words.length) return { scores: new Map(strict.map(([k, v]) => [k, v.score])), loose: false };
  const best = Math.max(0, ...[...scores.values()].map((s) => s.hits));
  return {
    scores: new Map([...scores].filter(([, s]) => s.hits >= Math.max(1, best)).map(([k, v]) => [k, v.score])),
    loose: best > 0,
  };
}

// faceting -------------------------------------------------------------

type Except = FacetParam | "sub" | "mode" | "h" | "category" | null;

function matches(it: CatalogItem, f: Filters, except: Except) {
  if (f.category && except !== "category" && it.category !== f.category) return false;
  if (f.sub && except !== "sub" && it.subcategory !== f.sub) return false;
  if (f.mode && except !== "mode" && !it.modes.includes(f.mode)) return false;
  if (f.h && except !== "h") {
    const b = HEIGHTS.find((x) => x.id === f.h)!;
    const wh = height(it);
    if (wh === null || wh < b.min || wh >= b.max) return false;
  }
  for (const g of FACET_GROUPS) {
    const sel = f.facets[g.param];
    if (!sel.length || except === g.param) continue;
    const vals = facetValues(it, g.facet).map(slugify);
    if (!sel.some((s) => vals.includes(s))) return false;
  }
  return true;
}

function interleave(items: CatalogItem[]) {
  const groups = new Map<string, CatalogItem[]>();
  for (const i of items) {
    const k = `${i.category}/${i.subcategory}`;
    groups.set(k, [...(groups.get(k) ?? []), i]);
  }
  const lanes = [...groups.values()];
  const out: CatalogItem[] = [];
  for (let r = 0; out.length < items.length; r++) for (const l of lanes) if (l[r]) out.push(l[r]);
  return out;
}

export type Option = { value: string; label: string; count: number };
export type FacetGroupView = { param: string; label: string; options: Option[]; selected: string[] };

export type CatalogView = {
  filters: Filters;
  total: number;
  results: CardData[];
  loose: boolean;
  modeCounts: Record<"all" | Mode, number>;
  categories: Option[];
  subs: Option[];
  heights: Option[];
  facets: FacetGroupView[];
  active: { param: string; value: string | null; label: string }[];
};

export function catalogView(f: Filters): CatalogView {
  const search = f.q ? searchScores(f.q) : null;
  const pool = search ? catalog.filter((i) => search.scores.has(i.slug)) : catalog;
  const where = (except: Except) => pool.filter((i) => matches(i, f, except));

  let results = where(null);
  const sort = f.sort === "relevance" && !search ? null : f.sort;
  // "Featured" (no query, no sort): interleave product lines so one family doesn't flood the grid
  if (!sort && !f.sub) results = interleave(results);
  if (sort === "relevance" && search) results = [...results].sort((a, b) => search.scores.get(b.slug)! - search.scores.get(a.slug)!);
  if (sort === "name") results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "height-asc" || sort === "height-desc") {
    const dir = sort === "height-asc" ? 1 : -1;
    results = [...results].sort((a, b) => {
      const ha = height(a);
      const hb = height(b);
      if (ha === null || hb === null) return ha === null ? (hb === null ? 0 : 1) : -1;
      return (ha - hb) * dir;
    });
  }

  const count = <T extends string>(items: CatalogItem[], key: (i: CatalogItem) => T[]) => {
    const m = new Map<T, number>();
    for (const i of items) for (const k of key(i)) m.set(k, (m.get(k) ?? 0) + 1);
    return m;
  };

  const byMode = where("mode");
  const byCat = count(where("category"), (i) => [i.category]);
  const cat = f.category ? getCategory(f.category) : null;
  const bySub = count(where("sub"), (i) => (i.subcategory ? [i.subcategory] : []));
  const byH = count(where("h"), (i) => {
    const wh = height(i);
    return wh === null ? [] : HEIGHTS.filter((b) => wh >= b.min && wh < b.max).map((b) => b.id);
  });

  const facets: FacetGroupView[] = FACET_GROUPS.map((g) => {
    const c = count(where(g.param), (i) => facetValues(i, g.facet));
    const options = [...c]
      .map(([label, n]) => ({ value: slugify(label), label, count: n }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
    return { param: g.param, label: g.label, options, selected: f.facets[g.param] };
  }).filter((g) => g.options.length > 1 || g.selected.length);

  const active: CatalogView["active"] = [];
  if (f.q) active.push({ param: "q", value: null, label: `“${f.q}”` });
  if (f.category && !cat) active.push({ param: "category", value: null, label: categoryLabel(f.category) });
  if (f.sub) active.push({ param: "sub", value: null, label: cat?.subcategories.find((s) => s.slug === f.sub)?.name ?? f.sub });
  if (f.h) active.push({ param: "h", value: null, label: HEIGHTS.find((x) => x.id === f.h)!.label });
  for (const g of FACET_GROUPS)
    for (const v of f.facets[g.param]) active.push({ param: g.param, value: v, label: facetLabelsById.get(`${g.param}:${v}`) ?? v });

  return {
    filters: f,
    total: results.length,
    results: results.slice(0, f.show).map(toCard),
    loose: search?.loose ?? false,
    modeCounts: {
      all: byMode.length,
      buy: byMode.filter((i) => i.modes.includes("buy")).length,
      rent: byMode.filter((i) => i.modes.includes("rent")).length,
    },
    categories: catalogCategories.map((c) => ({ value: c.slug, label: categoryLabel(c.slug), count: byCat.get(c.slug) ?? 0 })),
    subs: (cat?.subcategories ?? [])
      .map((s) => ({ value: s.slug, label: s.name, count: bySub.get(s.slug) ?? 0 }))
      .filter((o) => o.count > 0 || o.value === f.sub),
    heights: HEIGHTS.map((b) => ({ value: b.id, label: b.label, count: byH.get(b.id) ?? 0 })).filter((o) => o.count > 0 || o.value === f.h),
    facets,
    active,
  };
}

/** Suggestions for empty states: popular families. */
export const SUGGESTIONS = [
  { label: "Scissor lifts", href: "/products/aerial-work-platform?sub=scissor-lift" },
  { label: "Spider lifts", href: "/products/aerial-work-platform?sub=spider-lift" },
  { label: "Boom lifts", href: "/products/aerial-work-platform?sub=boom-lift" },
  { label: "Scaffold towers", href: "/products/aluminium-scaffold" },
  { label: "Everything for rent", href: "/products?mode=rent" },
];

// ------------------------------------------------------------------ legacy URLs

/** Legacy category segment → canonical category slug (handles aliases like tactical-safety-for-access-falls). */
export function canonicalCategory(seg: string | null | undefined) {
  if (!seg) return null;
  const s = decodeURIComponent(seg).toLowerCase();
  return categoryAlias(s) ?? (categoryAliases[s] && getCategory(categoryAliases[s]) ? categoryAliases[s] : null);
}

/** Whether `legacy` was the item's separate "-rent" listing (legacySlugs = [buy?, rent?]). */
const isRentSlug = (it: CatalogItem, legacy: string) =>
  it.kind === "equipment" && it.modes.includes("rent") && it.legacySlugs[it.legacySlugs.length - 1] === legacy;

const withMode = (href: string, mode: Mode | null) => (mode ? `${href}?mode=${mode}` : href);

export function productTarget(legacySlug: string, mode: Mode | null = null) {
  const it = getItemByLegacySlug(decodeURIComponent(legacySlug));
  if (!it) return null;
  const m = mode ?? (isRentSlug(it, decodeURIComponent(legacySlug)) ? "rent" : null);
  // only worth carrying when the item offers both modes
  return withMode(productHref(it), m && it.modes.length > 1 && it.modes.includes(m) ? m : null);
}

export function categoryTarget(catSeg: string, sub?: string | null, mode?: Mode | null) {
  const cat = canonicalCategory(catSeg);
  if (!cat) return null;
  const c = getCategory(cat)!;
  const s = sub ? decodeURIComponent(sub).toLowerCase() : null;
  // system categories: each "subcategory" is one system page
  if (s && isSystemCategory(cat)) {
    const it = getItemByLegacySlug(s);
    if (it && it.category === cat) return productHref(it);
  }
  const q = new URLSearchParams();
  if (s && c.subcategories.some((x) => x.slug === s)) q.set("sub", s);
  if (mode) q.set("mode", mode);
  const qs = q.toString();
  return `/products/${cat}${qs ? `?${qs}` : ""}`;
}

/** Map any legacy product URL (path + optional query) onto the new catalog. */
export function resolveLegacyPath(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url, "https://www.mtandt.com");
  } catch {
    return null;
  }
  if (!/(^|\.)mtandt\.com$/.test(u.hostname)) return null;
  const parts = u.pathname.split("/").filter(Boolean);
  const [head, a, b] = parts;
  switch (head) {
    case "product-detail":
      return a ? productTarget(a) : "/products";
    case "product-category-buy":
      return a ? categoryTarget(a, b, "buy") : "/products?mode=buy";
    case "product-category-rental":
    case "product-category-rentel":
      return a ? categoryTarget(a, b, "rent") : "/products?mode=rent";
    case "category-by-subcategory":
    case "categoryBySubcategory":
      return a ? categoryTarget(a) : "/products";
    case "custom-product-detail-buy":
    case "custom-product-detail-rental": {
      const mode: Mode | null = head.endsWith("rental") ? "rent" : null;
      return b ? productTarget(b, mode) : a ? categoryTarget(a) : "/products";
    }
    case "search": {
      const q = u.searchParams.get("q") ?? u.searchParams.get("search");
      return q ? `/products?q=${encodeURIComponent(q)}` : "/products";
    }
    case "compare":
      return "/products/compare";
  }
  return null;
}

// ------------------------------------------------------------------ rich text

/** Tidy scraped HTML for `.prose-mt`: drop inline styles/fonts, empty paragraphs, and rewrite legacy links. */
export function cleanHtml(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/\s(style|class|align|width|height|face|color|size)="[^"]*"/gi, "")
    .replace(/<\/?(font|span)[^>]*>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/href="([^"]+)"/g, (m, href: string) => {
      const abs = href.replace(/^https?:\/\/(www\.)?mtandt\.com/i, "");
      if (!abs.startsWith("/")) return m;
      return `href="${resolveLegacyPath(abs) ?? abs}"`;
    })
    .replace(/<a\s+href="([^"]+)"[^>]*>\s*([^<]*?)\s*<\/a>\s*<a\s+href="\1"[^>]*>/g, '<a href="$1">$2 ')
    .replace(/<p>(\s|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<(h[1-6])>\s*<\/\1>/gi, "")
    .trim();
}

export const plainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// ------------------------------------------------------------------ related services

const SERVICES: Record<string, string[]> = {
  "aerial-work-platform": ["mewp-operator-training", "amc", "remote-monitoring-system-telematics"],
  "material-handling-equipment": ["equipment-operator-training", "amc", "maintenance-services"],
  mlit: ["amc", "maintenance-services", "remote-monitoring-system-telematics"],
  "aluminium-scaffold": ["work-at-height-training", "maintenance-services", "equipment-manpower"],
  "fall-protection-lifeline-systems": ["work-at-height-training", "inspection-and-survey", "rope-access-operations-and-services"],
  "web-systems-international": ["work-at-height-training", "rope-access-operations-and-services", "industrial-safety-training"],
  "temporary-road-mats": ["equipment-manpower", "yard-services", "industrial-safety-training"],
  "tools-and-supplies": ["industrial-safety-training", "work-at-height-training", "competency-certifications"],
};
export const servicesFor = (category: string) => SERVICES[category] ?? ["amc", "work-at-height-training", "equipment-manpower"];

// ------------------------------------------------------------------ detail helpers

const HERO_SPEC = [/working height/i, /platform height|lifting height/i, /capacity|swl|load/i, /power|fuel|battery/i, /outreach|reach/i, /weight/i, /dimension|size/i, /material|strength/i];

/** Up to 4 headline specs for the detail hero strip, in a sensible priority order. */
export function heroSpecs(it: CatalogItem, n = 4): Spec[] {
  const specs = it.specs.filter(([k, v]) => v && !/^model/i.test(k));
  const out: [string, string][] = [];
  for (const re of HERO_SPEC) {
    const hit = specs.find(([k]) => re.test(k) && !out.some(([o]) => o === k));
    if (hit) out.push(hit);
    if (out.length >= n) break;
  }
  for (const s of specs) if (out.length < n && !out.includes(s)) out.push(s);
  return out.map(fmtSpec);
}

/** Human labels for one facet of an item (e.g. industries served). */
export const itemFacetLabels = (it: CatalogItem, facet: FacetKey) => facetValues(it, facet);

/** "CONSULTATION" → "Consultation" */
export const sentenceCase = (s: string) => (s === s.toUpperCase() ? s.charAt(0) + s.slice(1).toLowerCase() : s);

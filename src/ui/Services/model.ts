/**
 * View-model helpers for the services pages. Pure functions over the scraped legacy
 * copy (src/content/services.ts) — no data is changed, only reshaped for the UI.
 */
import { scrapedServices, servicesIndex, type ServiceDetailData, type ServiceHubData } from "@/content/services";

export type FamilySlug = "cesl" | "equipr" | "eat";

export type Family = {
  slug: FamilySlug;
  /** Human family name used across the IA (matches servicesMenu in nav.ts) */
  title: string;
  short: string;
  brand: string;
  /** Service slugs that belong to this family (hub excluded) */
  members: string[];
};

/**
 * Legacy crumbs label every service "Equipment Management", so family membership is
 * defined here (hub sub-service lists + nav.ts servicesMenu + subject matter).
 */
export const families: Family[] = [
  {
    slug: "cesl",
    title: "Training & Certification",
    short: "Training",
    brand: "CESL",
    members: [
      "work-at-height-training",
      "mewp-operator-training",
      "gwo-basic-safety-training",
      "equipment-operator-training",
      "industrial-safety-training",
      "competency-certifications",
    ],
  },
  {
    slug: "equipr",
    title: "Equipment Management",
    short: "Equipment",
    brand: "EQUIPR",
    members: ["amc", "maintenance-services", "repair-services", "yard-services", "remote-monitoring-system-telematics", "equipment-manpower"],
  },
  {
    slug: "eat",
    title: "Rope Access",
    short: "Rope access",
    brand: "EAT",
    members: [
      "rope-access-operations-and-services",
      "offshore-and-onshore-solutions",
      "inspection-and-survey",
      "maintenance-and-repairs",
      "consultancy-and-training",
      "rope-access-training",
    ],
  },
];

/** Legacy slugs whose page is a byte-for-byte duplicate of another service. */
export const duplicateServices: Record<string, string> = {
  "fall-protection-training": "equipment-operator-training",
};

export const familyOf = (slug: string): Family | null =>
  families.find((f) => f.slug === slug || f.members.includes(slug)) ?? null;

export const isHub = (slug: string) => families.some((f) => f.slug === slug);

// ---------------------------------------------------------------- text helpers

const ENTITIES: Record<string, string> = { "&amp;": "&", "&nbsp;": " ", "&quot;": '"', "&#39;": "'", "&rsquo;": "’", "&lt;": "<", "&gt;": ">" };

export function plainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|h\d)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/gi, (m) => ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First sentence(s) up to `max` chars, cut on a sentence boundary when possible. */
export function summary(text: string, max = 200): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const dot = cut.lastIndexOf(". ");
  return dot > max * 0.5 ? cut.slice(0, dot + 1) : `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

const SMALL = new Set(["and", "or", "of", "for", "the", "at", "to", "in", "on", "a"]);
const KEEP = new Set(["AMC", "MEWP", "MEWPS", "GWO", "CESL", "EAT", "EQUIPR"]);

/** "EQUIPMENT AMC" → "Equipment AMC" (legacy headings are stored upper-case). */
export function titleCase(s: string): string {
  if (s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .split(/(\s+|\(|\))/)
    .map((w, i) => {
      const up = w.toUpperCase();
      if (KEEP.has(up)) return up === "MEWPS" ? "MEWPs" : up;
      if (i > 0 && SMALL.has(w)) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("");
}

// ---------------------------------------------------------------- body parsing

export type Fact = { label: string; value: string };
export type Feature = { title: string; html: string; icon?: string | null };

export type ParsedBody = {
  html: string;
  facts: Fact[];
  features: Feature[];
  standards: string[];
  benefits: string[];
};

const FACT = /^(duration|batch size|certification|training format|format|target audience|target participants|prerequisites|materials provided)$/i;

function listItems(ul: string): string[] {
  return [...ul.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1].trim()).filter((x) => plainText(x).length > 0);
}

function tidy(html: string): string {
  let out = html
    .replace(/<ul>\s*<\/ul>/gi, "")
    .replace(/<p>\s*(<br\s*\/?>\s*)*<\/p>/gi, "")
    .replace(/<h\d>\s*(<br\s*\/?>\s*)*<\/h\d>/gi, "")
    .replace(/<p>\s*<br\s*\/?>/gi, "<p>")
    // stray <br/> between block elements
    .replace(/(<\/(?:h\d|ul|ol|p)>|^)\s*(?:<br\s*\/?>\s*)+(?=<(?:h\d|ul|ol|p)[\s>]|$)/gi, "$1")
    .replace(/<ul>\s*<\/ul>/gi, "");
  // Headings left with no content under them (their list was lifted out)
  for (let i = 0; i < 3; i++) out = out.replace(/<h(\d)>[^<]*<\/h\1>\s*(?=<h\d>|$)/gi, "").trim();
  out = out.replace(/(^(\s*<br\s*\/?>)+|(<br\s*\/?>\s*)+$)/gi, "").trim();
  // Plain text with <br/> separators → paragraphs
  if (out && !/^\s*</.test(out)) {
    out = out
      .split(/(?:<br\s*\/?>\s*)+/i)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${p}</p>`)
      .join("");
  }
  return out;
}

/**
 * Lift the structured bits out of legacy service HTML so they can be laid out as
 * UI (spec list, feature grid, chips, checklist) instead of one long text column.
 */
export function parseServiceBody(raw: string, legacyFeatures: ServiceDetailData["features"] = []): ParsedBody {
  let html = raw;
  const facts: Fact[] = [];
  const features: Feature[] = [];
  let standards: string[] = [];
  let benefits: string[] = [];

  html = html.replace(/<h4>\s*Standards Followed\s*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/i, (_, ul: string) => {
    standards = listItems(ul).map(plainText);
    return "";
  });
  html = html.replace(/<h4>\s*Benefits\s*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/i, (_, ul: string) => {
    benefits = listItems(ul);
    return "";
  });

  // GWO-style nested lists: <li><h4>Topic:</h4></li><ul><li><h4>point</h4></li>…</ul>
  html = html.replace(/<li>\s*<h4>([^<]+?):?\s*<\/h4>\s*<\/li>\s*<ul>([\s\S]*?)<\/ul>/gi, (_, label: string, ul: string) => {
    const points = listItems(ul).map((x) => x.replace(/<\/?h\d>/gi, "").trim());
    features.push({ title: plainText(label).replace(/:$/, ""), html: `<ul>${points.map((p) => `<li>${p}</li>`).join("")}</ul>` });
    return "";
  });

  // <li><b>Label</b>: text</li>  and  <p><b>Label</b>: text</p>
  html = html.replace(
    /<(li|p)>\s*<b>\s*(?:<a[^>]*>)?([^<]+?)(?:<\/a>)?\s*<\/b>\s*[:–—-]\s*([\s\S]*?)<\/\1>/gi,
    (whole, tag: string, label: string, text: string) => {
      const l = plainText(label).replace(/:$/, "");
      if (FACT.test(l)) {
        facts.push({ label: l, value: plainText(text).replace(/\.$/, "") });
        return "";
      }
      if (tag.toLowerCase() === "li") {
        const linked = /<b>\s*<a[^>]*href="([^"]+)"/i.exec(whole)?.[1];
        features.push({ title: l, html: linked ? `${text.trim()} <a href="${linked}">Learn more</a>` : text.trim() });
        return "";
      }
      return whole;
    },
  );

  for (const f of legacyFeatures) {
    const text = plainText(f.html);
    if (text || f.title) features.push({ title: f.title || text, html: f.title ? f.html : "", icon: f.icon });
  }

  return { html: tidy(html), facts, features, standards, benefits };
}

/** "<li><b>Boom Lifts:</b> Dingli, XCMG…</li>" → rows of brand chips */
export function parseSupported(html: string): { type: string; brands: string[] }[] {
  return [...html.matchAll(/<li>\s*<b>\s*([^<]+?)\s*<\/b>\s*([^<]*)<\/li>/gi)].map((m) => ({
    type: m[1].replace(/:$/, "").trim(),
    brands: m[2]
      .replace(/^:\s*/, "")
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean),
  }));
}

// ---------------------------------------------------------------- listings

export type ServiceCardData = {
  slug: string;
  title: string;
  excerpt: string;
  images: string[];
  family: FamilySlug | null;
};

/** Paragraph copy only (skips headings / lists), for excerpts. */
export function leadText(html: string): string {
  const paras = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => plainText(m[1])).filter(Boolean);
  return paras.length ? paras.join(" ") : plainText(parseServiceBody(html).html || html);
}

type Listed ={ slug: string; title: string; excerpt: string; images: string[] };

/** Index entries (from listServices) enriched with family + a real excerpt. */
export function toCards(listed: Listed[]): ServiceCardData[] {
  return listed.map((s) => {
    const page = scrapedServices[s.slug];
    const detail = page?.kind === "detail" ? page : null;
    const weak = !s.excerpt || s.excerpt.trim().toLowerCase() === s.title.trim().toLowerCase() || s.excerpt.length < 40;
    const raw = s.excerpt.trim();
    const excerpt = weak && detail ? summary(leadText(detail.html), 150) : /[.!?…]$/.test(raw) ? raw : `${raw.slice(0, raw.lastIndexOf(" "))}…`;
    return {
      slug: s.slug,
      title: titleCase(s.title),
      excerpt,
      // CMS image first; then the page photo (unique per service — several legacy
      // index thumbnails are shared between services); legacy thumbnail last.
      images: (() => {
        const thumb = indexEntry(s.slug)?.image ?? null;
        return [...s.images.filter((u) => u !== thumb), detail?.image, thumb].filter((u): u is string => !!u);
      })(),
      family: familyOf(s.slug)?.slug ?? null,
    };
  });
}

export const hubData = (slug: FamilySlug) => scrapedServices[slug] as ServiceHubData;

export const indexEntry = (slug: string) => servicesIndex.items.find((i) => i.slug === slug) ?? null;

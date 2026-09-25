import { cache } from "react";
import {
  BLOGS_PER_PAGE,
  blogFallback,
  events,
  pressItems,
  scrapedBlogs,
  type BlogCard,
  type EventItem,
  type PressItem,
} from "@/content/media";
import { lexicalToText, mediaUrl, payloadClient } from "@/lib/payload";
import type { Blog } from "@/payload-types";

/* ------------------------------------------------------------------ types */

export type NewsType = "all" | "articles" | "press" | "events" | "gallery";
export const NEWS_TYPES: NewsType[] = ["all", "articles", "press", "events", "gallery"];
export const TYPE_LABEL: Record<Exclude<NewsType, "all">, string> = {
  articles: "Article",
  press: "Press",
  events: "Event",
  gallery: "Gallery",
};

export const parseType = (v: string | string[] | undefined): NewsType => {
  const s = Array.isArray(v) ? v[0] : v;
  return NEWS_TYPES.includes(s as NewsType) ? (s as NewsType) : "all";
};
export const parsePage = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isInteger(n) && n > 0 ? n : 1;
};
export const parseStr = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? "").trim().slice(0, 80);

/** One row in the mixed newsroom feed. */
export type FeedItem = {
  kind: "articles" | "press" | "events";
  key: string;
  href: string;
  title: string;
  date: string | null;
  image: string | null;
  label: string | null;
  excerpt: string | null;
};

/* ------------------------------------------------------------------ dates */

const parseISO = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dm = (d: Date, month: "short" | "long") => `${d.getUTCDate()} ${(month === "long" ? MONTH : MON)[d.getUTCMonth()]}`;

/** "19 Mar 2026" / "19 March 2026" */
export function fmtDate(iso: string | null | undefined, month: "short" | "long" = "short") {
  const d = parseISO(iso);
  return d ? `${dm(d, month)} ${d.getUTCFullYear()}` : "";
}

/** "19–21 Mar 2026", "29 Aug – 2 Sep 2025"; ignores an end date that precedes the start. */
export function fmtRange(from: string | null, to: string | null) {
  const a = parseISO(from);
  const b = parseISO(to);
  if (!a) return "";
  if (!b || b <= a) return fmtDate(from);
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  if (sameYear && a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${fmtDate(to)}`;
  if (sameYear) return `${dm(a, "short")} – ${fmtDate(to)}`;
  return `${fmtDate(from)} – ${fmtDate(to)}`;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

/** An event is upcoming until its last day has passed. */
export const isUpcoming = (e: Pick<EventItem, "from" | "to">, today = todayISO()) => {
  const end = e.to && e.from && e.to >= e.from ? e.to : e.from;
  return !!end && end >= today;
};

export const eventYear = (e: EventItem) => (e.from ? Number(e.from.slice(0, 4)) : 0);

/* ------------------------------------------------------------------ text */

const ENTITIES: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—" };
export function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) => (e[0] === "#" ? String.fromCharCode(Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m)))
    .replace(/\s+/g, " ")
    .trim();
}

export function clip(text: string, max = 180) {
  return text.length > max ? text.slice(0, max).replace(/\s\S*$/, "") + "…" : text;
}

/** Strip legacy inline styling / empty blocks so bodies inherit `.prose-mt`. */
export function cleanHtml(html: string) {
  return html
    // scraped legacy footer: "<h4>Tags:</h4> links… <b>Share:</b> icons" (rendered by the template instead)
    .replace(/<h[1-6][^>]*>\s*Tags:?\s*<\/h[1-6]>[\s\S]*$/i, "")
    .replace(/<b>\s*Share:\s*<\/b>[\s\S]*$/i, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/\s(style|class|align|width|height|face|color|size)="[^"]*"/gi, "")
    .replace(/<\/?(font|span)[^>]*>/gi, "")
    .replace(/<(p|div|h[1-6])>(\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, "")
    .replace(/<h1(\s|>)/gi, "<h2$1")
    .replace(/<\/h1>/gi, "</h2>");
}

export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220));

/* ------------------------------------------------------------------ events */

/** Stall / booth and hall, parsed from the event body copy ("Stall Number: B-56", "Booth: A9 | HALL 4"). */
export function eventFacts(e: EventItem) {
  const text = htmlToText(e.body);
  let stall: string | null = null;
  for (const m of text.matchAll(/\b(?:[Ss]tall|[Bb]ooth)(?:\s*(?:[Nn]umber|[Nn]o\.?))?\s*:?\s*(?:[Hh]all\s*\d+\s*\|\s*)?([A-Z]{0,3}-?\d+[A-Z]?(?:[-/][0-9A-Z]+)*|[A-Z]\d+(?:-[A-Z]?\d+)?)/g)) {
    if (/\d/.test(m[1])) {
      stall = m[1];
      break;
    }
  }
  const hall = text.match(/\b[Hh](?:all|ALL)\s*(?:[Nn]o\.?\s*)?(\d+)/)?.[1] ?? null;
  return { stall, hall };
}

export const sortedEvents = () => [...events].sort((a, b) => (b.from ?? "").localeCompare(a.from ?? ""));
export const sortedPress = () => [...pressItems].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

export const pressExcerpt = (p: PressItem, max = 170) => clip(p.meta.description && p.meta.description !== p.title ? p.meta.description : htmlToText(p.body.replace(/<h[1-6][\s\S]*?<\/h[1-6]>/gi, " ")), max);
/** Legacy press cards have no outlet name; tags such as "Magazine" hint at coverage vs. our own release. */
export const pressSource = (p: PressItem) => (p.tags.some((t) => /magazine/i.test(t)) ? "Media coverage" : "Press release");

/* ------------------------------------------------------------------ blogs */

const listSelect = { title: true, slug: true, category: true, publishedDate: true, hero: true, thumbnail: true, excerpt: true } as const;

/**
 * Every published blog as a card (no bodies), newest first. The newsroom filters,
 * paginates and searches this in memory — ~120 rows. Only the handful of posts with a
 * scraped fallback load their body, to apply `blogFallback`.
 */
export const allBlogCards = cache(async (): Promise<BlogCard[]> => {
  try {
    const payload = await payloadClient();
    const published = { _status: { equals: "published" as const } };
    const res = await payload.find({
      collection: "blogs",
      where: published,
      sort: ["-publishedDate", "-id"],
      limit: 0,
      depth: 1,
      select: listSelect,
    });
    const docs = res.docs as Blog[];
    const withFallback = docs.filter((d) => scrapedBlogs[d.slug]).map((d) => d.slug);
    const bodies = new Map<string, Blog["body"]>();
    if (withFallback.length) {
      const b = await payload.find({
        collection: "blogs",
        where: { ...published, slug: { in: withFallback } },
        limit: 0,
        depth: 0,
        select: { slug: true, body: true },
      });
      b.docs.forEach((d) => bodies.set(d.slug, (d as Blog).body));
    }
    return docs.map((d) => {
      const body = bodies.get(d.slug);
      const fb = body ? blogFallback({ slug: d.slug, body }) : null;
      return {
        slug: d.slug,
        title: d.title,
        category: d.category?.trim() || null,
        date: d.publishedDate ?? null,
        image: fb?.card || mediaUrl(d.thumbnail) || mediaUrl(d.hero),
        excerpt: d.excerpt ?? null,
      };
    });
  } catch (err) {
    console.error("[newsroom] blogs query failed", err);
    return [];
  }
});

export const catKey = (c: string) =>
  c
    .toLowerCase()
    .replace(/[®™]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Categories used by 3+ posts (case-insensitive), most used first; label = most common spelling. */
export function blogCategories(cards: BlogCard[]) {
  const map = new Map<string, { key: string; label: string; count: number; spellings: Map<string, number> }>();
  for (const c of cards) {
    if (!c.category) continue;
    const key = catKey(c.category);
    const e = map.get(key) ?? { key, label: c.category, count: 0, spellings: new Map() };
    e.count++;
    e.spellings.set(c.category, (e.spellings.get(c.category) ?? 0) + 1);
    map.set(key, e);
  }
  return [...map.values()]
    .map((e) => ({ key: e.key, count: e.count, label: [...e.spellings.entries()].sort((a, b) => b[1] - a[1])[0][0] }))
    .filter((e) => e.count > 2)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export { BLOGS_PER_PAGE };

/* ------------------------------------------------------------------ feed */

export const articleFeedItem = (b: BlogCard): FeedItem => ({
  kind: "articles",
  key: `a-${b.slug}`,
  href: `/blogs/${b.slug}`,
  title: b.title,
  date: b.date,
  image: b.image,
  label: b.category,
  excerpt: b.excerpt,
});
export const pressFeedItem = (p: PressItem): FeedItem => ({
  kind: "press",
  key: `p-${p.slug}`,
  href: `/press/${p.slug}`,
  title: p.title,
  date: p.date,
  image: p.image,
  label: pressSource(p),
  excerpt: pressExcerpt(p, 150),
});
export const eventFeedItem = (e: EventItem): FeedItem => ({
  kind: "events",
  key: `e-${e.slug}`,
  href: `/event/${e.slug}`,
  title: e.title,
  date: e.from,
  image: e.thumb,
  label: e.location || null,
  excerpt: clip(e.excerpt, 150),
});

/** Articles, press and events interleaved by date, newest first. */
export async function mixedFeed() {
  const blogs = await allBlogCards();
  return [...blogs.map(articleFeedItem), ...pressItems.map(pressFeedItem), ...events.map(eventFeedItem)].sort((a, b) =>
    (b.date ?? "").slice(0, 10).localeCompare((a.date ?? "").slice(0, 10)),
  );
}

export const matches = (q: string) => {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  return (s: string | null | undefined) => {
    const t = (s ?? "").toLowerCase();
    return terms.every((w) => t.includes(w));
  };
};


/** Page numbers with gaps: [1, "…", 4, 5, 6, "…", 10] */
export function pageList(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((n) => n >= 1 && n <= total));
  if (page <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (page >= total - 2) [total - 1, total - 2, total - 3].forEach((n) => set.add(n));
  const nums = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export { lexicalToText };

import eventsJson from "@/content/scraped/events.json";
import galleryJson from "@/content/scraped/gallery.json";
import pressJson from "@/content/scraped/press.json";
import scrapedBlogsJson from "@/app/(frontend)/blogs/[slug]/scraped.json";
import { lexicalToText, mediaUrl, payloadClient } from "@/lib/payload";
import type { Blog } from "@/payload-types";

export const MEDIA_BANNER = "/legacy/imageFile/1682412326.jpg";
export const BLOGS_PER_PAGE = 12;
export const EVENTS_PER_PAGE = 10;

type Meta = { title: string; description: string };

export type PressItem = {
  slug: string;
  title: string;
  cardTitle: string;
  date: string | null;
  image: string | null;
  body: string;
  tags: string[];
  meta: Meta;
};

export type EventItem = {
  slug: string;
  title: string;
  image: string | null;
  thumb: string | null;
  from: string | null;
  to: string | null;
  location: string;
  excerpt: string;
  body: string;
  gallery: string[];
  tags: string[];
  meta: Meta;
};

export type GalleryItem = { type: "image" | "video"; src: string };

export type BlogCard = {
  slug: string;
  title: string;
  category: string | null;
  date: string | null;
  image: string | null;
  excerpt: string | null;
};

export const pressItems = pressJson as PressItem[];
export const events = eventsJson as EventItem[];
export const gallery = galleryJson as GalleryItem[];

export const getPress = (slug: string) => pressItems.find((p) => p.slug === slug) ?? null;
export const getEvent = (slug: string) => events.find((e) => e.slug === slug) ?? null;

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parts(iso: string | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return { y: d.getUTCFullYear(), m: MONTHS[d.getUTCMonth()], d: String(d.getUTCDate()).padStart(2, "0") };
}

/** "March 19,2026" — the legacy blog-card format. */
export function fmtLong(iso: string | null | undefined) {
  const p = parts(iso);
  return p ? `${p.m} ${p.d},${p.y}` : "";
}

/** "19 March 2026" — sidebar / press format. */
export function fmtDMY(iso: string | null | undefined) {
  const p = parts(iso);
  return p ? `${Number(p.d)} ${p.m} ${p.y}` : "";
}

export function eventRange(e: Pick<EventItem, "from" | "to">, sep = " - ") {
  return [e.from, e.to].filter(Boolean).join(sep);
}

// ---------------------------------------------------------------- blogs (Payload)
export type ScrapedBlog = {
  title: string;
  date: string | null;
  hero: string | null;
  card: string | null;
  category: string;
  body: string;
  tags: string[];
  meta: Meta;
};

/** Scraped copies of a few live posts; used only where the Payload doc still holds seed content. */
export const scrapedBlogs = scrapedBlogsJson as Record<string, ScrapedBlog>;

/** Seed docs in Payload have the body "Demo content." and a placeholder hero. */
export function blogFallback(b: Pick<Blog, "slug" | "body">): ScrapedBlog | null {
  const fb = scrapedBlogs[b.slug];
  return fb && lexicalToText(b.body, 40) === "Demo content." ? fb : null;
}

function toCard(b: Blog): BlogCard {
  const fb = blogFallback(b);
  return {
    slug: b.slug,
    title: b.title,
    category: b.category ?? null,
    date: b.publishedDate ?? null,
    image: fb?.card || mediaUrl(b.thumbnail) || mediaUrl(b.hero),
    excerpt: b.excerpt ?? null,
  };
}

const cardSelect = {
  title: true,
  slug: true,
  category: true,
  publishedDate: true,
  hero: true,
  thumbnail: true,
  excerpt: true,
  body: true,
} as const;

const published = { _status: { equals: "published" as const } };

export async function getBlogPage(page: number) {
  const payload = await payloadClient();
  const res = await payload.find({
    collection: "blogs",
    where: published,
    sort: ["-publishedDate", "-id"],
    limit: BLOGS_PER_PAGE,
    page,
    depth: 1,
    select: cardSelect,
  });
  return { cards: res.docs.map((d) => toCard(d as Blog)), totalPages: res.totalPages, page: res.page ?? page };
}

export async function getBlog(slug: string) {
  const payload = await payloadClient();
  const res = await payload.find({ collection: "blogs", where: { slug: { equals: slug }, ...published }, limit: 1, depth: 1 });
  return (res.docs[0] as Blog | undefined) ?? null;
}

export async function getLatestBlogs(excludeSlug: string, limit = 7) {
  const payload = await payloadClient();
  const res = await payload.find({
    collection: "blogs",
    where: { ...published, slug: { not_equals: excludeSlug } },
    sort: ["-publishedDate", "-id"],
    limit,
    depth: 1,
    select: cardSelect,
  });
  return res.docs.map((d) => toCard(d as Blog));
}

export async function getBlogSlugs() {
  const payload = await payloadClient();
  const res = await payload.find({ collection: "blogs", where: published, limit: 0, depth: 0, select: { slug: true } });
  return res.docs.map((d) => d.slug);
}

export const blogHero = (b: Blog) => blogFallback(b)?.hero || mediaUrl(b.hero) || mediaUrl(b.thumbnail);

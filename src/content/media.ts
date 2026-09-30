import { unstable_cache } from "next/cache";
import eventsJson from "@/content/scraped/events.json";
import galleryJson from "@/content/scraped/gallery.json";
import pressJson from "@/content/scraped/press.json";
import scrapedBlogsJson from "@/app/(frontend)/blogs/[slug]/scraped.json";
import { cached, fileUrl, html, readAll, readGlobal, str } from "@/cms/read";
import { lexicalToText, mediaUrl, payloadClient } from "@/lib/payload";
import type { Blog, Event, MediaPage, Press } from "@/payload-types";

export const MEDIA_BANNER = "/legacy/imageFile/1682412326.jpg";
export const BLOGS_PER_PAGE = 12;
export const EVENTS_PER_PAGE = 10;

/** Legacy meta (scraped) or the admin SEO tab; `image` only comes from the CMS. */
type Meta = { title: string; description: string; image?: string | null };

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

/** Admin-set meta title/description for a listing page (null = keep the page's defaults). */
export type ListingSeo = { title: string | null; description: string | null; image?: string | null } | null;

export type MediaPagesData = {
  banner: string;
  gallery: GalleryItem[];
  seo: { blogs: ListingSeo; press: ListingSeo; events: ListingSeo; gallery: ListingSeo };
};

// ---------------------------------------------------------------- press / events / gallery (CMS, scraped fallback)
const published = { _status: { equals: "published" as const } };

/** CMS date (stored at midday UTC) -> "YYYY-MM-DD", the scraped format. */
const day = (v: string | null | undefined) => (v ? new Date(v).toISOString().slice(0, 10) : null);

const meta = (m: { title?: string | null; description?: string | null; image?: unknown } | undefined): Meta => ({
  title: m?.title ?? "",
  description: m?.description ?? "",
  image: fileUrl(m?.image as Parameters<typeof fileUrl>[0]),
});

const seoOf = (m: { title?: string | null; description?: string | null; image?: unknown } | undefined): ListingSeo => {
  const out = { title: str(m?.title), description: str(m?.description), image: fileUrl(m?.image as Parameters<typeof fileUrl>[0]) };
  return out.title || out.description || out.image ? out : null;
};

/** The live DB held a seed event and press release before the import existed; only switch
 * to the CMS once the import has brought in the scraped items (matched by slug). */
function imported<T extends { slug: string }>(docs: T[] | null, scraped: { slug: string }[]): docs is T[] {
  return Boolean(docs?.some((d) => scraped.some((s) => s.slug === d.slug)));
}

/** Press releases in list order (highest position first). */
export const pressItems = cached(async (): Promise<PressItem[]> => {
  const docs = await readAll<Press>("press", { where: published, sort: ["-order", "-createdAt"] });
  if (!imported(docs, pressJson)) return pressJson as PressItem[];
  return docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    cardTitle: str(d.cardTitle) ?? d.title,
    date: day(d.publishedDate),
    image: fileUrl(d.hero),
    body: html(d.body),
    tags: d.tags ?? [],
    meta: meta(d.meta),
  }));
}, "media-press");

/** Events, newest first. */
export const events = cached(async (): Promise<EventItem[]> => {
  const docs = await readAll<Event>("events", { where: published, sort: ["-fromDate", "id"] });
  if (!imported(docs, eventsJson)) return eventsJson as EventItem[];
  return docs.map((d) => ({
    slug: d.slug,
    title: d.title,
    image: fileUrl(d.hero),
    thumb: fileUrl(d.thumbnail),
    from: day(d.fromDate),
    to: day(d.toDate),
    location: d.location ?? "",
    excerpt: d.excerpt ?? "",
    body: html(d.body),
    gallery: (d.gallery ?? []).map((g) => fileUrl(g.image)).filter((x): x is string => !!x),
    tags: d.tags ?? [],
    meta: meta(d.meta),
  }));
}, "media-events");

export const getMediaPages = cached(async (): Promise<MediaPagesData> => {
  const doc = await readGlobal<MediaPage>("media-pages", 1);
  if (!doc)
    return {
      banner: MEDIA_BANNER,
      gallery: galleryJson as GalleryItem[],
      seo: { blogs: null, press: null, events: null, gallery: null },
    };
  return {
    banner: fileUrl(doc.banner) ?? MEDIA_BANNER,
    gallery: (doc.gallery ?? []).flatMap((g): GalleryItem[] => {
      const src = g.type === "video" ? str(g.videoUrl) : fileUrl(g.image);
      return src ? [{ type: g.type, src }] : [];
    }),
    seo: { blogs: seoOf(doc.meta), press: seoOf(doc.pressSeo), events: seoOf(doc.eventsSeo), gallery: seoOf(doc.gallerySeo) },
  };
}, "media-pages");

export const gallery = async () => (await getMediaPages()).gallery;

export const getPress = async (slug: string) => (await pressItems()).find((p) => p.slug === slug) ?? null;
export const getEvent = async (slug: string) => (await events()).find((e) => e.slug === slug) ?? null;

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

async function fetchBlogPage(page: number) {
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

async function fetchBlog(slug: string) {
  const payload = await payloadClient();
  const res = await payload.find({ collection: "blogs", where: { slug: { equals: slug }, ...published }, limit: 1, depth: 1 });
  return (res.docs[0] as Blog | undefined) ?? null;
}

async function fetchLatestBlogs(excludeSlug: string, limit = 7) {
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

async function fetchBlogSlugs() {
  const payload = await payloadClient();
  const res = await payload.find({ collection: "blogs", where: published, limit: 0, depth: 0, select: { slug: true } });
  return res.docs.map((d) => d.slug);
}

// Blog reads are cached across requests (Payload/Supabase round-trips were ~0.3–1s per page view).
const BLOG_CACHE = { revalidate: 600, tags: ["blogs"] };
export const getBlogPage = unstable_cache(fetchBlogPage, ["blog-page"], BLOG_CACHE);
export const getBlog = unstable_cache(fetchBlog, ["blog"], BLOG_CACHE);
export const getLatestBlogs = unstable_cache(fetchLatestBlogs, ["blog-latest"], BLOG_CACHE);
export const getBlogSlugs = unstable_cache(fetchBlogSlugs, ["blog-slugs"], BLOG_CACHE);

export const blogHero = (b: Blog) => blogFallback(b)?.hero || mediaUrl(b.hero) || mediaUrl(b.thumbnail);

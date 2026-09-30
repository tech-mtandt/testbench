import scrapedBlogs from "@/app/(frontend)/blogs/[slug]/scraped.json";
import events from "@/content/scraped/events.json";
import gallery from "@/content/scraped/gallery.json";
import press from "@/content/scraped/press.json";

import { eachTask, fillGlobal, lexical, mapSeq, media, onceTask, texts, upsert } from "../helpers";
import type { ImportContext, ImportTask } from "../types";

// Same constant as src/content/media.ts (not imported: that module pulls in Next's cache).
const MEDIA_BANNER = "/legacy/imageFile/1682412326.jpg";

/** "YYYY-MM-DD" -> stored at midday UTC, as the admin date picker does. */
const date = (d: string | null | undefined) => (d ? `${d}T12:00:00.000Z` : null);

/** Skip the (slow) uploads for docs that exist and won't be overwritten. */
async function exists(ctx: ImportContext, collection: "events" | "press", slug: string) {
  if (ctx.overwrite) return false;
  const found = await ctx.payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, req: ctx.req });
  return found.docs.length > 0;
}

// ---------------------------------------------------------------- blogs

type LexNode = { type: string; value?: unknown; text?: string; children?: LexNode[]; [k: string]: unknown };

let blogEditor: unknown = null;

/**
 * HTML -> Lexical for blog bodies: like `lexical()` but with the blogs editor (tables),
 * and <img> tags become upload nodes (imported to Media) instead of being dropped.
 * Uploads are lifted out of their paragraph/heading so the editor can handle them.
 */
async function blogLexical(ctx: ImportContext, source: string): Promise<any> {
  const lex: any = await import("@payloadcms/richtext-lexical");
  const { JSDOM } = await import("jsdom");
  blogEditor ??= await lex.editorConfigFactory.fromFeatures({
    config: ctx.payload.config,
    features: ({ defaultFeatures }: { defaultFeatures: unknown[] }) => [...defaultFeatures, lex.EXPERIMENTAL_TableFeature()],
  });

  const ids = new Map<string, number | null>();
  for (const [, src] of source.matchAll(/<img\b[^>]*?\bsrc="([^"]+)"[^>]*>/gi)) {
    if (!ids.has(src)) ids.set(src, await media(ctx, src));
  }
  const withUploads = source.replace(/<img\b[^>]*?\bsrc="([^"]+)"[^>]*>/gi, (_, src: string) => {
    const id = ids.get(src);
    return id ? `<img data-lexical-upload-relation-to="media" data-lexical-upload-id="${id}" src="${src}">` : "";
  });

  const state = lex.convertHTMLToLexical({ editorConfig: blogEditor, html: withUploads, JSDOM });
  const fix = (n: LexNode): LexNode => ({ ...n, value: Number(n.value), fields: n.fields ?? null });
  state.root.children = (state.root.children as LexNode[]).flatMap((block): LexNode[] => {
    if (block.type === "upload") return [fix(block)];
    const kids = block.children ?? [];
    const uploads = kids.filter((c) => c.type === "upload");
    if (!uploads.length) return [block];
    const rest = kids.filter((c) => c.type !== "upload");
    const keep = rest.some((c) => c.type !== "linebreak" && (c.type !== "text" || c.text?.trim()));
    return [...(keep ? [{ ...block, children: rest }] : []), ...uploads.map(fix)];
  });
  return state.root.children.length ? state : null;
}

type ScrapedBlog = { hero: string | null; card: string | null; body: string; tags: string[]; meta: { title: string; description: string } };

/** Plain text of a Lexical value (enough to spot the seed placeholder). */
function text(value: unknown): string {
  const out: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const node = n as { text?: string; children?: unknown[]; root?: unknown };
    if (typeof node.text === "string") out.push(node.text);
    if (node.root) walk(node.root);
    node.children?.forEach(walk);
  };
  walk(value);
  return out.join(" ").replace(/\s+/g, " ").trim();
}

async function importBlog(ctx: ImportContext, [slug, b]: [string, ScrapedBlog]) {
  const found = await ctx.payload.find({ collection: "blogs", where: { slug: { equals: slug } }, limit: 1, depth: 0, req: ctx.req });
  const doc = found.docs[0];
  if (!doc) {
    ctx.log(`  - blog ${slug} not in the CMS, skipped`);
    return;
  }
  const data: Record<string, unknown> = {};
  if (!doc.tags?.length || ctx.overwrite) data.tags = texts(b.tags);
  // Only where the body is still the seed placeholder: never replace real content.
  if (text(doc.body) === "Demo content.") {
    const body = await blogLexical(ctx, b.body);
    if (body) {
      data.body = body;
      const hero = await media(ctx, b.hero, doc.title);
      const card = await media(ctx, b.card, doc.title);
      if (hero) data.hero = hero;
      if (card) data.thumbnail = card;
    }
  }
  const meta = doc.meta ?? {};
  if (!meta.title?.trim() || !meta.description?.trim())
    data.meta = {
      ...meta,
      title: meta.title?.trim() ? meta.title : b.meta.title,
      description: meta.description?.trim() ? meta.description : b.meta.description,
    };
  if (!Object.keys(data).length) return;
  await ctx.payload.update({ collection: "blogs", id: doc.id, data: data as any, depth: 0, req: ctx.req });
  ctx.log(`  updated blog ${slug} (${Object.keys(data).join(", ")})`);
}

// ---------------------------------------------------------------- tasks

export const mediaTasks: ImportTask[] = [
  // Gallery/banner images first (one per step); the global then just looks the ids up.
  eachTask(
    "media-gallery-images",
    "Media gallery images",
    () => [MEDIA_BANNER, ...gallery.filter((g) => g.type === "image").map((g) => g.src)],
    async (ctx, src) => {
      await media(ctx, src);
    },
  ),
  onceTask("media-pages", "Media pages (banner, gallery)", (ctx) =>
    fillGlobal(ctx, "media-pages", async () => ({
      banner: await media(ctx, MEDIA_BANNER, "Media"),
      gallery: (
        await mapSeq(gallery, async (g) =>
          g.type === "video" ? { type: "video", videoUrl: g.src } : { type: "image", image: await media(ctx, g.src) },
        )
      ).filter((g) => g.type === "video" || g.image),
    })),
  ),
  eachTask("media-events", "Events", () => events, async (ctx, e) => {
    if (await exists(ctx, "events", e.slug)) return;
    await upsert(ctx, "events", { slug: { equals: e.slug } }, {
      title: e.title,
      slug: e.slug,
      eventName: e.title,
      hero: await media(ctx, e.image, e.title),
      thumbnail: await media(ctx, e.thumb, e.title),
      excerpt: e.excerpt,
      body: await lexical(ctx, e.body),
      fromDate: date(e.from),
      toDate: date(e.to),
      location: e.location,
      gallery: (await mapSeq(texts(e.gallery), (src) => media(ctx, src, e.title))).filter(Boolean).map((image) => ({ image })),
      tags: texts(e.tags),
      meta: { title: e.meta.title, description: e.meta.description },
    });
  }),
  eachTask("media-press", "Press releases", () => press, async (ctx, p, i) => {
    if (await exists(ctx, "press", p.slug)) return;
    await upsert(ctx, "press", { slug: { equals: p.slug } }, {
      title: p.title,
      cardTitle: p.cardTitle,
      slug: p.slug,
      hero: await media(ctx, p.image, p.title),
      body: await lexical(ctx, p.body),
      publishedDate: date(p.date),
      tags: texts(p.tags),
      // The list keeps the old site's order: highest position first.
      order: press.length - i,
      meta: { title: p.meta.title, description: p.meta.description },
    });
  }),
  eachTask("media-blogs", "Blog tags, bodies and SEO", () => Object.entries(scrapedBlogs as Record<string, ScrapedBlog>), importBlog),
];

/**
 * Shared helpers for importers (scraped JSON -> Payload). Server-only; loaded lazily
 * by the import endpoint and CLI so jsdom never reaches a page bundle.
 */
import { existsSync, readFileSync } from "fs";
import path from "path";
import type { CollectionSlug, GlobalSlug, Where } from "payload";

import type { ImportContext, ImportTask } from "./types";

// ---------- time budget ----------

export const outOfTime = (ctx: ImportContext) => Date.now() > ctx.deadline;

/** Build a task that walks `items` one by one, resumable by index. */
export function eachTask<T>(
  key: string,
  label: string,
  items: () => T[],
  fn: (ctx: ImportContext, item: T, index: number) => Promise<void>,
): ImportTask {
  return {
    key,
    label,
    async run(ctx, cursor) {
      const list = items();
      for (let i = cursor; i < list.length; i++) {
        if (i > cursor && outOfTime(ctx)) return i;
        try {
          await fn(ctx, list[i], i);
        } catch (err) {
          ctx.log(`  ! ${label} #${i}: ${(err as Error).message.split("\n")[0]}`);
        }
      }
      return null;
    },
  };
}

/** Build a single-shot task. */
export const onceTask = (key: string, label: string, fn: (ctx: ImportContext) => Promise<void>): ImportTask => ({
  key,
  label,
  async run(ctx) {
    await fn(ctx);
    return null;
  },
});

// ---------- rich text ----------

let toLexical: ((html?: unknown) => unknown) | null = null;

/** HTML string -> Lexical editor state for a richText field. */
export async function lexical(ctx: ImportContext, html: unknown): Promise<any> {
  if (!toLexical) {
    const lex: any = await import("@payloadcms/richtext-lexical");
    const { JSDOM } = await import("jsdom");
    const editorConfig = await lex.editorConfigFactory.default({ config: ctx.payload.config });
    toLexical = (h) => {
      const s = (h ?? "").toString().trim();
      if (!s || s === "null") return null;
      try {
        const state = lex.convertHTMLToLexical({ editorConfig, html: s, JSDOM });
        return state?.root?.children?.length ? state : null;
      } catch {
        return null;
      }
    };
  }
  return toLexical(html);
}

// ---------- files ----------

/** Where legacy /legacy/* assets can be downloaded from (mirrors next.config rewrites). */
function legacyBase(): string {
  if (process.env.LEGACY_ASSETS_BASE) return process.env.LEGACY_ASSETS_BASE;
  const { S3_ENDPOINT, S3_BUCKET } = process.env;
  if (S3_ENDPOINT && S3_BUCKET) {
    const ref = new URL(S3_ENDPOINT).hostname.split(".")[0];
    return `https://${ref}.supabase.co/storage/v1/object/public/${S3_BUCKET}/legacy`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com"}/legacy`;
}

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp3: "audio/mpeg",
};

async function loadFile(src: string): Promise<{ data: Buffer; mimetype: string; name: string; size: number } | null> {
  let rel: string;
  let url: string;
  if (src.startsWith("/legacy/")) {
    rel = src.slice("/legacy/".length);
    const local = path.join(process.cwd(), "public", "legacy", decodeURIComponent(rel));
    if (existsSync(local)) {
      const data = readFileSync(local);
      return { data, ...meta(rel), size: data.length };
    }
    url = `${legacyBase()}/${rel}`;
  } else if (/^https?:\/\//.test(src)) {
    rel = new URL(src).pathname;
    url = src;
  } else {
    return null;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status} ${url}`);
  const data = Buffer.from(await res.arrayBuffer());
  const m = meta(rel);
  return { data, mimetype: res.headers.get("content-type")?.split(";")[0] || m.mimetype, name: m.name, size: data.length };
}

function meta(rel: string) {
  let name = decodeURIComponent(rel.split("/").pop() || "file");
  name = name.replace(/[^\w.\-]+/g, "-");
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return { name, mimetype: MIME[ext] ?? "application/octet-stream" };
}

const fileCache = new Map<string, number | null>();

/**
 * Ensure a legacy file is in an upload collection and return its id (dedupe by legacySrc).
 * Accepts "/legacy/..." paths and absolute URLs; returns null for empty values or files
 * that can't be fetched (logged, never fatal).
 */
export async function legacyFile(
  ctx: ImportContext,
  collection: "media" | "documents",
  src: unknown,
  alt?: string | null,
): Promise<number | null> {
  const s = typeof src === "string" ? src.trim() : "";
  if (!s) return null;
  const key = `${collection}:${s}`;
  if (fileCache.has(key)) return fileCache.get(key)!;
  const found = await ctx.payload.find({
    collection,
    where: { legacySrc: { equals: s } },
    limit: 1,
    depth: 0,
    req: ctx.req,
  });
  if (found.docs.length) {
    fileCache.set(key, found.docs[0].id as number);
    return found.docs[0].id as number;
  }
  try {
    const file = await loadFile(s);
    if (!file) {
      fileCache.set(key, null);
      return null;
    }
    const data: Record<string, unknown> = { legacySrc: s };
    if (collection === "media") data.alt = (alt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")).slice(0, 250);
    const doc = await ctx.payload.create({ collection, data: data as any, file, depth: 0, req: ctx.req });
    fileCache.set(key, doc.id as number);
    return doc.id as number;
  } catch (err) {
    ctx.log(`  ! file ${s}: ${(err as Error).message.split("\n")[0]}`);
    fileCache.set(key, null);
    return null;
  }
}

export const media = (ctx: ImportContext, src: unknown, alt?: string | null) => legacyFile(ctx, "media", src, alt);
export const document = (ctx: ImportContext, src: unknown) => legacyFile(ctx, "documents", src);

/** Map over items sequentially (keeps DB/S3 load predictable). */
export async function mapSeq<T, R>(items: T[] | null | undefined, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (const [i, item] of (items ?? []).entries()) out.push(await fn(item, i));
  return out;
}

// ---------- documents ----------

/**
 * Create a doc, or update it when it exists and `overwrite` is on; returns its id.
 * Drafts-enabled collections are written as published.
 */
export async function upsert(
  ctx: ImportContext,
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
): Promise<number | null> {
  const found = await ctx.payload.find({ collection, where, limit: 1, depth: 0, req: ctx.req });
  const drafts = Boolean(ctx.payload.collections[collection]?.config.versions?.drafts);
  const body = drafts ? { ...data, _status: "published" } : data;
  if (found.docs.length) {
    const id = found.docs[0].id as number;
    if (!ctx.overwrite) {
      ctx.log(`  skipped ${collection} ${JSON.stringify(where)} (exists)`);
      return id;
    }
    await ctx.payload.update({ collection, id, data: body as any, depth: 0, req: ctx.req });
    ctx.log(`  updated ${collection} ${JSON.stringify(where)}`);
    return id;
  }
  const doc = await ctx.payload.create({ collection, data: body as any, depth: 0, req: ctx.req, draft: false });
  ctx.log(`  created ${collection} ${JSON.stringify(where)}`);
  return doc.id as number;
}

/** Fill a global unless it was already saved (or `overwrite` is on). */
export async function fillGlobal(
  ctx: ImportContext,
  slug: GlobalSlug,
  build: () => Promise<Record<string, unknown>>,
): Promise<void> {
  const current = (await ctx.payload.findGlobal({ slug, depth: 0, req: ctx.req })) as { updatedAt?: string };
  if (current?.updatedAt && !ctx.overwrite) {
    ctx.log(`  skipped global ${slug} (already has content)`);
    return;
  }
  await ctx.payload.updateGlobal({ slug, data: (await build()) as any, depth: 0, req: ctx.req });
  ctx.log(`  saved global ${slug}`);
}

/** Array-of-strings helpers for `text` fields with hasMany / [{value}] arrays. */
export const texts = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()) : []);
export const pairs = (v: unknown): { label: string; value: string }[] =>
  Array.isArray(v) ? v.filter(Array.isArray).map(([label, value]) => ({ label: String(label ?? ""), value: String(value ?? "") })) : [];

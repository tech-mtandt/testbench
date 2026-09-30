/**
 * Frontend read helpers for CMS-backed content.
 *
 * Pattern: each content module fetches from Payload through `cached()`, maps the
 * documents back into the exact shape the page components already take (the shape
 * of the scraped JSON), and falls back to the scraped JSON when the CMS has nothing
 * yet (not imported) or the database is unreachable. Rich text is rendered to an
 * HTML string and uploads to a URL string, so components stay unchanged.
 */
import { unstable_cache } from "next/cache";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { CollectionSlug, GlobalSlug, Where } from "payload";
import { payloadClient } from "@/lib/payload";

import { CMS_TAG } from "./tags";

export { CMS_TAG };

export const CMS_REVALIDATE = 600;

export function cached<A extends unknown[], R>(fn: (...args: A) => Promise<R>, key: string) {
  return unstable_cache(fn, [key], { revalidate: CMS_REVALIDATE, tags: [CMS_TAG] });
}

type Upload = { url?: string | null; legacySrc?: string | null } | number | string | null | undefined;

/** Upload field (media or documents) -> URL. Imported files keep their legacy path so the
 * pre-generated /legacy-opt WebP variants keep working. */
export function fileUrl(m: Upload): string | null {
  if (!m || typeof m !== "object") return null;
  return m.legacySrc || m.url || null;
}

/** Rich text -> HTML string ("" when empty). */
export function html(value: unknown): string {
  const data = value as SerializedEditorState | null | undefined;
  if (!data?.root?.children?.length) return "";
  try {
    const out = convertLexicalToHTML({ data, disableContainer: true });
    return out === "<p></p>" ? "" : out;
  } catch (err) {
    console.error("[cms] rich text render failed", err);
    return "";
  }
}

/** Non-empty string or null. */
export const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

/** A global's data, or null when it was never saved (not imported yet) or the DB failed. */
export async function readGlobal<T>(slug: GlobalSlug, depth = 1): Promise<T | null> {
  try {
    const payload = await payloadClient();
    const doc = (await payload.findGlobal({ slug, depth })) as unknown as T & { updatedAt?: string };
    return doc?.updatedAt ? doc : null;
  } catch (err) {
    console.error(`[cms] global "${slug}" read failed`, err);
    return null;
  }
}

/** All docs of a collection, or null when empty (not imported yet) or the DB failed. */
export async function readAll<T>(
  collection: CollectionSlug,
  opts: { depth?: number; sort?: string | string[]; where?: Where } = {},
): Promise<T[] | null> {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection,
      depth: opts.depth ?? 1,
      sort: opts.sort,
      where: opts.where,
      limit: 0,
      pagination: false,
    });
    return docs.length ? (docs as T[]) : null;
  } catch (err) {
    console.error(`[cms] collection "${collection}" read failed`, err);
    return null;
  }
}

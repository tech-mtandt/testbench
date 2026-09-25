import configPromise from "@payload-config";
import { getPayload } from "payload";
import type { Media } from "@/payload-types";

export const payloadClient = () => getPayload({ config: configPromise });

/** Resolve an upload field (id | populated doc | null) to a URL. */
export function mediaUrl(m: number | Media | null | undefined, size?: string): string | null {
  if (!m || typeof m !== "object") return null;
  const sizes = (m as Media & { sizes?: Record<string, { url?: string | null }> }).sizes;
  return (size && sizes?.[size]?.url) || m.url || null;
}

export function mediaAlt(m: number | Media | null | undefined, fallback = ""): string {
  return (m && typeof m === "object" && m.alt) || fallback;
}

/** Plain-text excerpt from a Lexical rich-text value. */
export function lexicalToText(value: unknown, max = 200): string {
  const out: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object" || out.join(" ").length > max) return;
    const node = n as { text?: string; children?: unknown[]; root?: unknown };
    if (typeof node.text === "string") out.push(node.text);
    if (node.root) walk(node.root);
    node.children?.forEach(walk);
  };
  walk(value);
  const t = out.join(" ").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max).replace(/\s\S*$/, "") + "…" : t;
}

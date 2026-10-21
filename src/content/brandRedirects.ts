/**
 * MTandT pages that moved to the group's brand websites (TsaF, AQ Access, Comet Bharat).
 * brand-redirects.json is the single list: next.config.mjs serves the 301s from it, and this
 * module points internal links straight at the brand page and keeps the pages out of the sitemap.
 */
import table from "./brand-redirects.json";

type Redirect = { from: string; to: string; also?: string[] };

const norm = (path: string) => {
  let p = path.split(/[?#]/)[0].toLowerCase();
  try {
    p = decodeURIComponent(p);
  } catch {}
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
};

const exact = new Map<string, string>();
for (const r of table.redirects as Redirect[]) for (const p of [r.from, ...(r.also ?? [])]) exact.set(norm(p), r.to);

/** The brand-website address an MTandT path redirects to, or null when the page stays here. */
export function brandRedirect(path: string): string | null {
  const p = norm(path);
  return exact.get(p) ?? table.sections.find((s) => p === s.prefix || p.startsWith(`${s.prefix}/`))?.to ?? null;
}

/** The address to link to: the brand website for moved pages, else the path itself. */
export const moved = (path: string) => brandRedirect(path) ?? path;

/** Blog posts that moved: left out of the blog list, sidebars and sitemap. */
export const movedBlogSlugs = (table.redirects as Redirect[]).flatMap((r) => r.from.match(/^\/blogs\/(.+)$/)?.[1] ?? []);

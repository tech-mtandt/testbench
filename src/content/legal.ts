import type { LegalPage as LegalDoc } from "@/payload-types";
import { cached, fileUrl, html, readAll, str } from "@/cms/read";
import legal from "@/content/scraped/legal.json";

export type LegalPage = { meta: { title: string; description: string }; title: string; crumb: string; html: string };
type Seo = { title: string | null; image: string | null };

const scraped = legal as Record<string, LegalPage>;

/** Legal pages by slug (/pages/<slug>): the `legal-pages` collection, or the scraped pages before import. */
export const getLegalPages = cached(async (): Promise<Record<string, LegalPage & { seo: Seo }>> => {
  const docs = await readAll<LegalDoc>("legal-pages", { depth: 1 });
  if (!docs) {
    return Object.fromEntries(Object.entries(scraped).map(([k, p]) => [k, { ...p, seo: { title: null, image: null } }]));
  }
  return Object.fromEntries(
    docs.map((d) => [
      d.slug,
      {
        meta: { title: d.title, description: d.meta?.description ?? "" },
        title: d.title,
        crumb: d.crumb || d.title,
        html: html(d.content),
        seo: { title: str(d.meta?.title), image: fileUrl(d.meta?.image) },
      },
    ]),
  );
}, "legal-pages");

export async function getLegalPage(slug: string) {
  return (await getLegalPages())[slug] ?? null;
}

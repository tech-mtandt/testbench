import type { AnnualReturnsPage } from "@/payload-types";
import { cached, fileUrl, readGlobal, str } from "@/cms/read";
import data from "@/content/scraped/annual-returns.json";

export type ReturnTab = { label: string; groups: { title: string; docs: { label: string; href: string }[] }[] };

/** The /annual-returns page: the `annual-returns-page` global, or the scraped page before import. */
export const getAnnualReturns = cached(async () => {
  const g = await readGlobal<AnnualReturnsPage>("annual-returns-page");
  if (!g) {
    return {
      banner: data.banner as string | null,
      tabs: data.tabs as ReturnTab[],
      meta: { title: data.meta.title, absolute: false, description: data.meta.description, image: null as string | null },
    };
  }
  const title = str(g.meta?.title);
  return {
    banner: fileUrl(g.banner),
    tabs: (g.tabs ?? []).map((t) => ({
      label: t.label,
      groups: (t.groups ?? []).map((gr) => ({
        title: gr.title,
        docs: (gr.docs ?? []).map((d) => ({ label: d.label, href: fileUrl(d.file) || d.href || "" })),
      })),
    })),
    meta: {
      title: title ?? data.meta.title,
      absolute: Boolean(title),
      description: str(g.meta?.description) ?? "",
      image: fileUrl(g.meta?.image),
    },
  };
}, "annual-returns-page");

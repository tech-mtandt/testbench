import caseStudiesData from "@/content/scraped/case-studies.json";
import type { CaseStudy as CaseStudyDoc } from "@/payload-types";
import { cached, fileUrl, html, readAll } from "@/cms/read";
import { cards, seoMeta, type CaseStudyCard, type SeoMeta } from "@/content/industries";

export type CaseStudy = {
  title: string;
  banner: string | null;
  blocks: { title: string; html: string }[];
  details: string[][];
  download: string | null;
  gallery: string[];
  related: CaseStudyCard[];
  seo?: SeoMeta;
};

const scraped = caseStudiesData as unknown as Record<string, CaseStudy>;

/** Every case study keyed by slug, CMS first, the scraped JSON as a whole-set fallback. */
const load = cached(async (): Promise<Record<string, CaseStudy>> => {
  const docs = await readAll<CaseStudyDoc>("case-studies", { sort: "createdAt" });
  if (!docs) return scraped;
  return Object.fromEntries(
    docs.map((d) => [
      d.slug,
      {
        title: d.title,
        banner: fileUrl(d.banner),
        blocks: (d.blocks ?? []).map((b) => ({ title: b.title, html: html(b.content) })),
        details: (d.details ?? []).map((r) => [r.label, r.value ?? ""]),
        download: fileUrl(d.download),
        gallery: (d.gallery ?? []).map((m) => fileUrl(m)).filter((u): u is string => Boolean(u)),
        related: cards(d.related),
        seo: seoMeta(d.meta),
      },
    ]),
  );
}, "case-studies");

export const getCaseStudySlugs = async () => Object.keys(await load());
export const getCaseStudy = async (slug: string): Promise<CaseStudy | null> => (await load())[slug] ?? null;

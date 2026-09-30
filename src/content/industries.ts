import industriesData from "@/content/scraped/industries.json";
import type { Industry as IndustryDoc, IndustriesPage } from "@/payload-types";
import { cached, fileUrl, html, readAll, readGlobal } from "@/cms/read";

export type IndustryCard = { title: string; text: string; href: string; icon: string | null };

export type CaseStudyCard = { title: string; text: string; href: string | null; image: string | null };

export type SeoMeta = { title: string | null; description: string | null; image: string | null } | null;

export type Industry = {
  title: string;
  banner: string | null;
  heading: string;
  html: string;
  images: string[];
  gallery: { image: string; title: string }[];
  caseStudies: CaseStudyCard[];
  clients: string[];
  seo?: SeoMeta;
};

type Industries = { index: IndustryCard[]; items: Record<string, Industry> };

const scraped = industriesData as unknown as Industries;

type Meta = { title?: string | null; description?: string | null; image?: unknown } | null | undefined;

export const seoMeta = (m: Meta): SeoMeta =>
  m ? { title: m.title || null, description: m.description || null, image: fileUrl(m.image as never) } : null;

const urls = (list: unknown[] | null | undefined) =>
  (list ?? []).map((m) => fileUrl(m as never)).filter((u): u is string => Boolean(u));

export const cards = (list: { title: string; text?: string | null; link?: string | null; image?: unknown }[] | null | undefined) =>
  (list ?? []).map((c) => ({ title: c.title, text: c.text ?? "", href: c.link || null, image: fileUrl(c.image as never) }));

/** Every industry (listing cards + pages), CMS first, the scraped JSON as a whole-set fallback. */
const load = cached(async (): Promise<Industries> => {
  const docs = await readAll<IndustryDoc>("industries", { sort: ["order", "title"] });
  if (!docs) return scraped;
  return {
    index: docs.map((d) => ({ title: d.title, text: d.cardText ?? "", href: `/industries/${d.slug}`, icon: d.icon ?? null })),
    items: Object.fromEntries(
      docs.map((d) => [
        d.slug,
        {
          title: d.title,
          banner: fileUrl(d.banner),
          heading: d.heading ?? "",
          html: html(d.content),
          images: urls(d.images),
          gallery: (d.gallery ?? []).flatMap((g) => {
            const image = fileUrl(g.image);
            return image ? [{ image, title: g.title ?? "" }] : [];
          }),
          caseStudies: cards(d.caseStudies),
          clients: urls(d.clients),
          seo: seoMeta(d.meta),
        },
      ]),
    ),
  };
}, "industries");

export const getIndustryIndex = async () => (await load()).index;
export const getIndustrySlugs = async () => Object.keys((await load()).items);
export const getIndustry = async (slug: string): Promise<Industry | null> => (await load()).items[slug] ?? null;

/** The /industries page's own banner + SEO (empty banner title, no image today). */
export const getIndustriesPage = cached(async () => {
  const g = await readGlobal<IndustriesPage>("industries-page");
  return { title: g?.title ?? "", banner: fileUrl(g?.banner), seo: seoMeta(g?.meta) };
}, "industries-page");

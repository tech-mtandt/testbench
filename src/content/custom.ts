import customData from "@/content/scraped/custom-products.json";
import industriesData from "@/content/scraped/industries.json";
import caseStudiesData from "@/content/scraped/case-studies.json";

export type Kind = "buy" | "rental";

export type GalleryItem = { image: string; title: string; caption: string; filters: string[] };

export type CustomProduct = {
  title: string;
  productId: string | null;
  meta: { title?: string | null; description?: string | null; keywords?: string | null };
  crumb: { label: string | null; href: string | null };
  hero: string | null;
  intro: string;
  specs: string[][];
  features: string;
  benefits: string;
  download: string | null;
  journey: { title: string; html: string }[];
  gallery: { filters: { id: string; label: string }[]; items: GalleryItem[] } | null;
  related: { title: string; href: string; image: string | null }[];
  clients: string[];
  category: string;
};

export type IndustryCard = { title: string; text: string; href: string; icon: string | null };

export type CaseStudyCard = { title: string; text: string; href: string | null; image: string | null };

export type Industry = {
  title: string;
  banner: string | null;
  heading: string;
  html: string;
  images: string[];
  gallery: { image: string; title: string }[];
  caseStudies: CaseStudyCard[];
  clients: string[];
};

export type CaseStudy = {
  title: string;
  banner: string | null;
  blocks: { title: string; html: string }[];
  details: string[][];
  download: string | null;
  gallery: string[];
  related: CaseStudyCard[];
};

const products = customData as unknown as Record<Kind, Record<string, CustomProduct>> & {
  aliases: Record<string, string>;
};

/** Legacy category segments that 301 to / duplicate another category on the live site. */
export const categoryAliases: Record<string, string> = products.aliases;

export function getCustomProduct(kind: Kind, category: string, slug: string): CustomProduct | null {
  const p = products[kind][slug];
  if (!p) return null;
  const canonical = categoryAliases[category] ?? category;
  return canonical === p.category ? p : null;
}

export function customProductParams(kind: Kind) {
  return Object.entries(products[kind]).flatMap(([slug, p]) => [
    { category: p.category, slug },
    ...Object.entries(categoryAliases)
      .filter(([, to]) => to === p.category)
      .map(([from]) => ({ category: from, slug })),
  ]);
}

export function customProductPath(kind: Kind, p: CustomProduct, slug: string) {
  return `/custom-product-detail-${kind}/${p.category}/${slug}`;
}

const industries = industriesData as unknown as { index: IndustryCard[]; items: Record<string, Industry> };

export const industryIndex = industries.index;
export const industrySlugs = Object.keys(industries.items);
export const getIndustry = (slug: string): Industry | null => industries.items[slug] ?? null;

const caseStudies = caseStudiesData as unknown as Record<string, CaseStudy>;

export const caseStudySlugs = Object.keys(caseStudies);
export const getCaseStudy = (slug: string): CaseStudy | null => caseStudies[slug] ?? null;

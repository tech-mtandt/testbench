import home from "@/content/scraped/home.json";
import { cached, fileUrl, readGlobal, str } from "@/cms/read";
import { homeDefaults } from "@/globals/Home";
import type { Home } from "@/payload-types";

export type HomeHeadings = typeof homeDefaults;

/** The scraped home.json shape, plus the headings and SEO values editable in the CMS. */
export type HomeData = {
  meta: typeof home.meta;
  slides: { image: string | null; eyebrow: string; title: string[] }[];
  productTabs: { label: string; items: { title: string; image: string | null; href: string | null }[] }[];
  brandTabs: {
    label: string;
    brands: { logo: string | null; alt: string; title: string; text: string; href: string | null }[];
  }[];
  serviceNavigator: { intro: string; items: { title: string; text: string; href: string; icon: string | null }[] };
  whyUs: { title: string; text: string }[];
  testimonials: { quote: string; author: string; logo: string | null }[];
  news: { href: string; title: string; date: string | null }[];
  clients: string[];
  headings: HomeHeadings;
  /** Admin SEO tab; null when not set (the layout defaults apply). */
  seo: { title: string | null; description: string | null; image: string | null } | null;
};

const fallback: HomeData = { ...home, headings: homeDefaults, seo: null };

const load = cached(async (): Promise<HomeData | null> => {
  const doc = await readGlobal<Home>("home", 1);
  if (!doc) return null;
  const headings = Object.fromEntries(
    (Object.keys(homeDefaults) as (keyof HomeHeadings)[]).map((k) => [k, str(doc[k]) ?? homeDefaults[k]]),
  ) as HomeHeadings;
  return {
    meta: home.meta,
    slides: (doc.slides ?? []).map((s) => ({
      image: fileUrl(s.image),
      eyebrow: s.eyebrow ?? "",
      title: (s.titleLines ?? []).map((l) => l.value).filter(Boolean),
    })),
    productTabs: (doc.productTabs ?? []).map((t) => ({
      label: t.label,
      items: (t.items ?? []).map((p) => ({ title: p.title, image: fileUrl(p.image), href: str(p.href) })),
    })),
    brandTabs: (doc.brandTabs ?? []).map((t) => ({
      label: t.label,
      brands: (t.brands ?? []).map((b) => ({
        logo: fileUrl(b.logo),
        alt: b.alt ?? "",
        title: b.title ?? "",
        text: b.text ?? "",
        href: str(b.href),
      })),
    })),
    serviceNavigator: {
      intro: doc.serviceNavigator?.intro ?? "",
      items: (doc.serviceNavigator?.items ?? []).map((s) => ({
        title: s.title,
        text: s.text ?? "",
        href: s.href,
        icon: fileUrl(s.icon),
      })),
    },
    whyUs: (doc.whyUs ?? []).map((w) => ({ title: w.tagline ?? "", text: w.excerpt ?? "" })),
    testimonials: (doc.testimonials ?? []).map((t) => ({
      quote: t.message ?? "",
      author: t.author ?? "",
      logo: fileUrl(t.logo),
    })),
    news: (doc.news ?? []).map((n) => ({ href: n.href, title: n.title, date: str(n.date) })),
    clients: (doc.clients ?? []).map((c) => fileUrl(c.logo)).filter((u): u is string => Boolean(u)),
    headings,
    seo:
      doc.meta?.title || doc.meta?.description || doc.meta?.image
        ? { title: str(doc.meta.title), description: str(doc.meta.description), image: fileUrl(doc.meta.image) }
        : null,
  };
}, "cms:home");

/** Homepage content: the `home` global, or the scraped JSON until it has been saved. */
export async function getHome(): Promise<HomeData> {
  return (await load()) ?? fallback;
}

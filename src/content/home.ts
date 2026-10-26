import home from "@/content/scraped/home.json";
import { modernizeDeep } from "@/content/urls";
import { cached, fileUrl, markCmsFailure, previewing, readGlobal, str } from "@/cms/read";
import { homeDefaults } from "@/globals/Home";
import { payloadClient } from "@/lib/payload";
import type { Home, Media } from "@/payload-types";

export type HomeHeadings = typeof homeDefaults;

/** The scraped home.json shape, plus the headings and SEO values editable in the CMS. */
export type HomeData = {
  meta: typeof home.meta;
  slides: Slide[];
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

/** A banner slide; with a video, `width`/`height` (its image's size) give the banner its shape. */
export type Slide = {
  image: string | null;
  eyebrow: string;
  title: string[];
  video: string | null;
  tallImage: string | null;
  tallVideo: string | null;
  width: number | null;
  height: number | null;
  tallWidth: number | null;
  tallHeight: number | null;
};

const fallback: HomeData = {
  ...home,
  slides: home.slides.map((s) => ({ ...s, video: null, tallImage: null, tallVideo: null, width: null, height: null, tallWidth: null, tallHeight: null })),
  headings: homeDefaults,
  seo: null,
};

const media = (m: number | Media | null | undefined) => (m && typeof m === "object" ? m : null);

function toHomeData(doc: Home): HomeData {
  const headings = Object.fromEntries(
    (Object.keys(homeDefaults) as (keyof HomeHeadings)[]).map((k) => [k, str(doc[k]) ?? homeDefaults[k]]),
  ) as HomeHeadings;
  return {
    meta: home.meta,
    slides: (doc.slides ?? []).map((s) => ({
      image: fileUrl(s.image),
      eyebrow: s.eyebrow ?? "",
      title: (s.titleLines ?? []).map((l) => l.value).filter(Boolean),
      video: fileUrl(s.video),
      tallImage: fileUrl(s.tallImage),
      tallVideo: fileUrl(s.tallVideo),
      width: media(s.image)?.width ?? null,
      height: media(s.image)?.height ?? null,
      tallWidth: media(s.tallImage)?.width ?? null,
      tallHeight: media(s.tallImage)?.height ?? null,
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
}

const load = cached(async (): Promise<HomeData | null> => {
  const doc = await readGlobal<Home>("home", 1);
  return doc ? toHomeData(doc) : null;
}, "cms:home");

/** The latest draft, for an editor's preview (admin Live Preview); never cached. */
async function loadDraft(): Promise<HomeData | null> {
  try {
    const payload = await payloadClient();
    return toHomeData((await payload.findGlobal({ slug: "home", depth: 1, draft: true })) as Home);
  } catch (err) {
    console.error('[cms] global "home" draft read failed', err);
    markCmsFailure();
    return null;
  }
}

/** Homepage content: the `home` global, or the scraped JSON until it has been saved. */
export async function getHome(): Promise<HomeData> {
  const data = (await previewing()) ? ((await loadDraft()) ?? (await load())) : await load();
  // Content saved with old-site catalogue links points at the current addresses.
  return modernizeDeep(data ?? fallback);
}

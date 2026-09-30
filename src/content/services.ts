import type { Service, ServicesPage } from "@/payload-types";
import { lexicalToText } from "@/lib/payload";
import { cached, fileUrl, html, readAll, readGlobal, str } from "@/cms/read";
import scrapedPages from "@/content/scraped/services.json";
import scrapedIndex from "@/content/scraped/services-index.json";
import { bgUrl } from "@/lib/img";
import { servicesMeta } from "@/content/pages-meta";

type Meta = { title: string; description: string };
type Crumb = { label: string; href: string | null };
type Pic = { src: string | null; alt: string } | null;

export type ServiceDetailData = {
  kind: "detail";
  meta: Meta;
  crumbs: Crumb[];
  bannerTitle: string;
  banner: string | null;
  heading: string;
  subheading: string;
  html: string;
  image: string | null;
  brochure: string | null;
  features: { icon: string | null; title: string; html: string }[];
  cta: { text: string; label: string; href: string | null } | null;
};

export type ServiceHubData = {
  kind: "hub";
  meta: Meta;
  logo: Pic;
  tagline: string;
  aboutTitle: string;
  aboutHtml: string;
  aboutImage: Pic;
  services: {
    title: string;
    intro: string;
    items: { title: string; text: string; href: string | null; image: string | null; alt: string }[];
  };
  why: { title: string; intro: string; items: { title: string; text: string }[] };
  supported?: { title: string; intro: string; image: Pic; html: string };
  brochure: string | null;
};

export type ScrapedService = ServiceDetailData | ServiceHubData;
export type ServicePageData = ScrapedService;

export const scrapedServices = scrapedPages as unknown as Record<string, ScrapedService>;
export const servicesIndex = scrapedIndex as {
  meta: Meta;
  banner: string | null;
  items: { slug: string; title: string; excerpt: string; button: string; image: string | null }[];
};

/**
 * The migrated `body` is mostly the legacy `innerDis` JSON array serialised as a single
 * paragraph (e.g. `["We offer on-time services…"]`). Only treat it as real content when it
 * is genuine rich text of some length.
 */
function usableBody(body: Service["body"]): Service["body"] | null {
  if (!body) return null;
  const text = lexicalToText(body, 400);
  if (text.length < 120 || text.startsWith("[")) return null;
  return body;
}

const pic = (upload: unknown, alt: string | null | undefined): Pic => {
  const src = fileUrl(upload as never);
  return src ? { src, alt: alt ?? "" } : null;
};

/**
 * Page structure of a service edited in the CMS (the "Page layout" is set), in the scraped
 * JSON shape; null while the service still relies on the built-in scraped copy.
 */
function toPage(d: Service): ScrapedService | null {
  const meta = { title: "", description: "" };
  const brochure = fileUrl(d.brochure);
  if (d.kind === "hub") {
    const h = d.hub ?? {};
    const sup = h.supported;
    return {
      kind: "hub",
      meta,
      logo: pic(h.logo, h.logoAlt),
      tagline: h.tagline ?? "",
      aboutTitle: h.aboutTitle ?? "",
      aboutHtml: html(h.aboutText),
      aboutImage: pic(h.aboutImage, h.aboutImageAlt),
      services: {
        title: h.offer?.title ?? "",
        intro: h.offer?.intro ?? "",
        items: (h.offer?.items ?? []).map((it) => ({
          title: it.title,
          text: it.text ?? "",
          href: str(it.href),
          image: fileUrl(it.image),
          alt: it.alt ?? "",
        })),
      },
      why: {
        title: h.why?.title ?? "",
        intro: h.why?.intro ?? "",
        items: (h.why?.items ?? []).map((w) => ({ title: w.title ?? "", text: w.text ?? "" })),
      },
      ...(sup?.title
        ? { supported: { title: sup.title, intro: sup.intro ?? "", image: pic(sup.image, sup.alt), html: html(sup.text) } }
        : {}),
      brochure,
    };
  }
  if (d.kind !== "detail") return null;
  const cta = d.cta;
  return {
    kind: "detail",
    meta,
    crumbs: (d.crumbs ?? []).map((c) => ({ label: c.label, href: str(c.href) })),
    bannerTitle: d.category ?? "",
    banner: fileUrl(d.poster),
    heading: d.heading ?? "",
    subheading: d.subheading ?? "",
    html: html(d.description),
    image: fileUrl(d.image),
    brochure,
    features: (d.features ?? []).map((f) => ({ icon: f.icon ?? null, title: f.title ?? "", html: html(f.text) })),
    cta: cta && (cta.text || cta.label || cta.href) ? { text: cta.text ?? "", label: cta.label ?? "", href: str(cta.href) } : null,
  };
}

/** Services from the CMS, trimmed to what the pages use (null before import / on DB failure). */
const fetchDbServices = cached(async () => {
  const docs = await readAll<Service>("services", { depth: 1, sort: "id" });
  return (
    docs?.map((d) => ({
      slug: d.slug,
      title: d.title,
      page: toPage(d),
      poster: fileUrl(d.poster),
      hero: fileUrl(d.hero),
      body: usableBody(d.body ?? null),
      listing: { show: d.showInListing !== false, order: d.order ?? null, excerpt: d.excerpt ?? "", button: d.button ?? "" },
      seo: { title: str(d.meta?.title), description: str(d.meta?.description), image: fileUrl(d.meta?.image) },
    })) ?? null
  );
}, "services");

/** Every service page slug: the scraped pages plus services laid out in the CMS. */
export async function getServiceSlugs(): Promise<string[]> {
  const db = (await fetchDbServices()) ?? [];
  return Array.from(new Set([...Object.keys(scrapedServices), ...db.filter((d) => d.page).map((d) => d.slug)]));
}

export async function getService(slug: string) {
  const db = (await fetchDbServices())?.find((s) => s.slug === slug) ?? null;
  const scraped = scrapedServices[slug] ?? null;
  // Per service: the CMS layout once it was imported/edited, otherwise the scraped copy.
  const page = db?.page ?? scraped;
  if (!page) return null;
  const legacyBanner = scraped?.kind === "detail" ? scraped.banner : null;
  return {
    slug,
    scraped: page,
    title: db?.title ?? (page.kind === "detail" ? page.heading : page.aboutTitle),
    /** Payload media first, scraped legacy copy underneath as a CSS fallback layer. */
    banners: [db?.poster, db?.page && !db.poster ? null : legacyBanner].filter(Boolean) as string[],
    body: db?.body ?? null,
    /** Admin SEO tab; empty fields fall back to the scraped legacy meta. `title` is admin-only (used verbatim). */
    seo: {
      title: db?.seo.title ?? null,
      description: db?.seo.description || scraped?.meta.description || null,
      image: db?.seo.image ?? null,
    },
    source: db?.page ? "db" : db ? (db.body ? "db+scrape (db body)" : "db+scrape") : "scrape",
  };
}

export async function listServices() {
  const db = (await fetchDbServices()) ?? [];
  const bySlug = new Map(db.map((d) => [d.slug, d]));
  const indexImage = new Map(servicesIndex.items.map((it) => [it.slug, it.image]));
  const rows: { order: number; slug: string; title: string; excerpt: string; button: string; images: string[] }[] = [];
  servicesIndex.items.forEach((it, i) => {
    const d = bySlug.get(it.slug);
    if (d?.page) return; // listed from the CMS below
    rows.push({
      order: i,
      slug: it.slug,
      title: d?.title ?? it.title,
      excerpt: it.excerpt,
      button: it.button,
      images: [d?.hero, it.image].filter(Boolean) as string[],
    });
  });
  for (const d of db) {
    if (!d.page || !d.listing.show) continue;
    rows.push({
      order: d.listing.order ?? Number.MAX_SAFE_INTEGER,
      slug: d.slug,
      title: d.title,
      excerpt: d.listing.excerpt,
      button: d.listing.button,
      images: [d.hero, indexImage.get(d.slug)].filter(Boolean) as string[],
    });
  }
  return rows.sort((a, b) => a.order - b.order).map(({ order: _order, ...r }) => r);
}

/** The /services listing page (banner, heading, SEO). */
export const getServicesPage = cached(async () => {
  const g = await readGlobal<ServicesPage>("services-page");
  if (!g) return { title: "Services", banner: servicesIndex.banner, meta: { ...servicesMeta, absolute: false, image: null } };
  return {
    title: g.title,
    banner: fileUrl(g.banner),
    meta: {
      title: str(g.meta?.title) ?? servicesMeta.title,
      absolute: Boolean(str(g.meta?.title)),
      description: str(g.meta?.description) ?? servicesMeta.description,
      image: fileUrl(g.meta?.image),
    },
  };
}, "services-page");

/** Layered CSS background: later layers show through when an earlier URL fails to load. */
export const bgLayers = (urls: string[]) =>
  urls.length ? { backgroundImage: urls.map((u) => `url("${bgUrl(u)}")`).join(", ") } : undefined;

import { cache } from "react";
import type { Service } from "@/payload-types";
import { payloadClient, mediaUrl, lexicalToText } from "@/lib/payload";
import scrapedPages from "@/content/scraped/services.json";
import scrapedIndex from "@/content/scraped/services-index.json";

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

export const scrapedServices = scrapedPages as unknown as Record<string, ScrapedService>;
export const servicesIndex = scrapedIndex as {
  meta: Meta;
  banner: string | null;
  items: { slug: string; title: string; excerpt: string; button: string; image: string | null }[];
};

export const serviceSlugs = Object.keys(scrapedServices);

const fetchDbServices = cache(async (): Promise<Service[]> => {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({ collection: "services", depth: 1, limit: 0, sort: "id" });
    return docs;
  } catch (err) {
    console.error("[services] DB read failed, falling back to scrape", err);
    return [];
  }
});

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

export async function getService(slug: string) {
  const scraped = scrapedServices[slug];
  if (!scraped) return null;
  const db = (await fetchDbServices()).find((s) => s.slug === slug) ?? null;
  return {
    slug,
    scraped,
    title: db?.title ?? (scraped.kind === "detail" ? scraped.heading : scraped.aboutTitle),
    /** Payload media first, scraped legacy copy underneath as a CSS fallback layer. */
    banners: [mediaUrl(db?.poster), scraped.kind === "detail" ? scraped.banner : null].filter(Boolean) as string[],
    body: usableBody(db?.body ?? null),
    source: db ? (usableBody(db.body ?? null) ? "db+scrape (db body)" : "db+scrape") : "scrape",
  };
}

export async function listServices() {
  const db = await fetchDbServices();
  return servicesIndex.items.map((it) => {
    const d = db.find((s) => s.slug === it.slug);
    return {
      slug: it.slug,
      title: d?.title ?? it.title,
      excerpt: it.excerpt,
      button: it.button,
      images: [mediaUrl(d?.hero), it.image].filter(Boolean) as string[],
    };
  });
}

/** Layered CSS background: later layers show through when an earlier URL fails to load. */
export const bgLayers = (urls: string[]) =>
  urls.length ? { backgroundImage: urls.map((u) => `url("${u}")`).join(", ") } : undefined;

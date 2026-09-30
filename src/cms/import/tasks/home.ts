import home from "@/content/scraped/home.json";
import { homeDefaults } from "@/globals/Home";

import { eachTask, fillGlobal, mapSeq, media, onceTask } from "../helpers";
import type { ImportContext, ImportTask } from "../types";

/** Every homepage image with its alt text, deduped by path (first alt wins). */
function images(): { src: string; alt: string }[] {
  const all = [
    ...home.slides.map((s) => ({ src: s.image, alt: [s.eyebrow, ...s.title].join(" - ") })),
    ...home.productTabs.flatMap((t) => t.items.map((p) => ({ src: p.image, alt: p.title }))),
    ...home.brandTabs.flatMap((t) => t.brands.map((b) => ({ src: b.logo, alt: b.alt || b.title }))),
    ...home.testimonials.map((t) => ({ src: t.logo, alt: t.author })),
    ...home.clients.map((src) => ({ src, alt: "Client logo" })),
  ];
  const seen = new Map<string, string>();
  for (const { src, alt } of all) if (src && !seen.has(src)) seen.set(src, alt);
  return [...seen].map(([src, alt]) => ({ src, alt }));
}

// Skip the (slow) uploads when the global is already filled and won't be overwritten.
const saved = new WeakMap<ImportContext, Promise<boolean>>();
function alreadySaved(ctx: ImportContext): Promise<boolean> {
  if (ctx.overwrite) return Promise.resolve(false);
  if (!saved.has(ctx)) {
    saved.set(
      ctx,
      ctx.payload
        .findGlobal({ slug: "home", depth: 0, req: ctx.req })
        .then((g) => Boolean((g as { updatedAt?: string }).updatedAt)),
    );
  }
  return saved.get(ctx)!;
}

async function build(ctx: ImportContext): Promise<Record<string, unknown>> {
  // Images were uploaded by the previous task; these calls are id lookups by legacySrc.
  const img = (src: string | null, alt: string) => media(ctx, src, alt);
  return {
    title: "Home",
    ...homeDefaults,
    slides: await mapSeq(home.slides, async (s) => ({
      image: await img(s.image, [s.eyebrow, ...s.title].join(" - ")),
      eyebrow: s.eyebrow,
      titleLines: s.title.map((value) => ({ value })),
    })),
    productTabs: await mapSeq(home.productTabs, async (t) => ({
      label: t.label,
      items: await mapSeq(t.items, async (p) => ({ title: p.title, image: await img(p.image, p.title), href: p.href })),
    })),
    brandTabs: await mapSeq(home.brandTabs, async (t) => ({
      label: t.label,
      brands: await mapSeq(t.brands, async (b) => ({
        logo: await img(b.logo, b.alt || b.title),
        alt: b.alt,
        title: b.title,
        text: b.text,
        href: b.href,
      })),
    })),
    serviceNavigator: {
      intro: home.serviceNavigator.intro,
      items: await mapSeq(home.serviceNavigator.items, async (s) => ({
        title: s.title,
        text: s.text,
        href: s.href,
        icon: await img(s.icon, s.title),
      })),
    },
    whyUs: home.whyUs.map((w) => ({ tagline: w.title, excerpt: w.text })),
    testimonials: await mapSeq(home.testimonials, async (t) => ({
      message: t.quote,
      author: t.author,
      logo: await img(t.logo, t.author),
    })),
    news: home.news.map((n) => ({ href: n.href, title: n.title, date: n.date })),
    clients: await mapSeq(home.clients, async (src) => ({ logo: await img(src, "Client logo") })),
    // The layout's default <title> equals the legacy home title, so this keeps the output
    // unchanged. The legacy description (home.json meta) differs from the layout default
    // description, so it is left empty to keep today's output; editors can fill it in.
    meta: { title: home.meta.title },
  };
}

export const homeTasks: ImportTask[] = [
  eachTask("home-media", "Homepage images", images, async (ctx, item) => {
    if (await alreadySaved(ctx)) return;
    await media(ctx, item.src, item.alt);
  }),
  onceTask("home-global", "Homepage", (ctx) => fillGlobal(ctx, "home", () => build(ctx))),
];

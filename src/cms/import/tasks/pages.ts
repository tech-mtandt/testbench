/**
 * Pages area: services (+ /services listing), catalogues page, partner forms, legal pages
 * and annual returns.
 *
 * SEO titles are stored with the " | MTandT" suffix the layout template adds today, because
 * an admin SEO title is used verbatim ({ absolute }) — so the rendered <title> stays the same.
 */
import { document, eachTask, fillGlobal, lexical, mapSeq, media, onceTask, upsert } from "../helpers";
import type { ImportContext, ImportTask } from "../types";

import servicesJson from "@/content/scraped/services.json";
import servicesIndexJson from "@/content/scraped/services-index.json";
import cataloguesJson from "@/content/scraped/catalogues.json";
import partnerFormsJson from "@/content/scraped/partner-forms.json";
import legalJson from "@/content/scraped/legal.json";
import annualReturnsJson from "@/content/scraped/annual-returns.json";
import { partnerMeta, servicesMeta, type PartnerKey } from "@/content/pages-meta";

const seoTitle = (t: string) => `${t} | MTandT`;

// ---------- services ----------

type Pic = { src: string | null; alt: string } | null;
type Detail = {
  kind: "detail";
  meta: { title: string; description: string };
  crumbs: { label: string; href: string | null }[];
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
type Hub = {
  kind: "hub";
  meta: { title: string; description: string };
  logo: Pic;
  tagline: string;
  aboutTitle: string;
  aboutHtml: string;
  aboutImage: Pic;
  services: { title: string; intro: string; items: { title: string; text: string; href: string | null; image: string | null; alt: string }[] };
  why: { title: string; intro: string; items: { title: string; text: string }[] };
  supported?: { title: string; intro: string; image: Pic; html: string };
  brochure: string | null;
};

const services = servicesJson as unknown as Record<string, Detail | Hub>;
const servicesIndex = servicesIndexJson as {
  banner: string | null;
  items: { slug: string; title: string; excerpt: string; button: string; image: string | null }[];
};

const FEATURE_ICONS = ["fas fa-clock", "fa fa-laptop", "fa fa-group"];

async function serviceLayout(ctx: ImportContext, p: Detail | Hub): Promise<Record<string, unknown>> {
  if (p.kind === "hub") {
    return {
      kind: "hub",
      hub: {
        logo: await media(ctx, p.logo?.src, p.logo?.alt),
        logoAlt: p.logo?.alt ?? "",
        tagline: p.tagline,
        aboutTitle: p.aboutTitle,
        aboutText: await lexical(ctx, p.aboutHtml),
        aboutImage: await media(ctx, p.aboutImage?.src, p.aboutImage?.alt),
        aboutImageAlt: p.aboutImage?.alt ?? "",
        offer: {
          title: p.services.title,
          intro: p.services.intro,
          items: await mapSeq(p.services.items, async (it) => ({
            title: it.title,
            text: it.text,
            href: it.href ?? "",
            image: await media(ctx, it.image, it.alt),
            alt: it.alt,
          })),
        },
        why: { title: p.why.title, intro: p.why.intro, items: p.why.items.map((w) => ({ title: w.title, text: w.text })) },
        supported: p.supported
          ? {
              title: p.supported.title,
              intro: p.supported.intro,
              image: await media(ctx, p.supported.image?.src, p.supported.image?.alt),
              alt: p.supported.image?.alt ?? "",
              text: await lexical(ctx, p.supported.html),
            }
          : {},
      },
      brochure: await document(ctx, p.brochure),
    };
  }
  return {
    kind: "detail",
    category: p.bannerTitle,
    crumbs: p.crumbs.map((c) => ({ label: c.label, href: c.href ?? "" })),
    heading: p.heading,
    subheading: p.subheading,
    description: await lexical(ctx, p.html),
    image: await media(ctx, p.image, p.heading),
    features: await mapSeq(p.features, async (f) => ({
      icon: f.icon && FEATURE_ICONS.includes(f.icon) ? f.icon : null,
      title: f.title,
      text: await lexical(ctx, f.html),
    })),
    cta: p.cta ? { text: p.cta.text, label: p.cta.label, href: p.cta.href ?? "" } : {},
    brochure: await document(ctx, p.brochure),
  };
}

/**
 * The 21 services already exist in the CMS (title, banner, card image, legacy body), so the
 * generic upsert would skip them: a service whose "Page layout" (kind) is empty counts as not
 * imported and gets the page structure, listing card and SEO filled in (existing values kept).
 */
const serviceTask = eachTask(
  "pages:services",
  "Services",
  () => Object.entries(services),
  async (ctx, [slug, p]) => {
    const found = await ctx.payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      req: ctx.req,
    });
    const doc = found.docs[0];
    if (doc?.kind && !ctx.overwrite) {
      ctx.log(`  skipped services ${slug} (already laid out)`);
      return;
    }
    const idx = servicesIndex.items.findIndex((it) => it.slug === slug);
    const card = idx >= 0 ? servicesIndex.items[idx] : null;
    const keep = (current: unknown) => Boolean(current) && !ctx.overwrite;
    const data: Record<string, unknown> = {
      ...(await serviceLayout(ctx, p)),
      showInListing: Boolean(card),
      order: card ? idx : null,
      // The listing showed the scraped teaser/button (the old excerpt field was unused).
      excerpt: card?.excerpt ?? "",
      button: card?.button ?? "",
      meta: {
        ...(doc?.meta ?? {}),
        title: keep(doc?.meta?.title) ? doc!.meta!.title : seoTitle(p.meta.title),
        description: keep(doc?.meta?.description) ? doc!.meta!.description : p.meta.description,
      },
    };
    // Card image and banner from the old database are what the site shows today: only fill gaps.
    if (!doc?.hero && card?.image) data.hero = await media(ctx, card.image, card.title);
    if (!doc?.poster && p.kind === "detail" && p.banner) data.poster = await media(ctx, p.banner, p.bannerTitle);
    if (doc) {
      await ctx.payload.update({ collection: "services", id: doc.id, data: data as any, depth: 0, req: ctx.req });
      ctx.log(`  updated services ${slug}`);
    } else {
      // Same title the page showed before import (listing card title, else the page heading).
      const title = card?.title ?? (p.kind === "detail" ? p.heading : p.aboutTitle);
      await ctx.payload.create({ collection: "services", data: { ...data, title, slug } as any, depth: 0, req: ctx.req });
      ctx.log(`  created services ${slug}`);
    }
  },
);

// ---------- catalogues ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Existing catalogues are matched by normalised title and only get their `order`; missing ones are created. */
const catalogueTask = eachTask(
  "pages:catalogues",
  "Catalogues",
  () => cataloguesJson.items,
  async (ctx, s) => {
    const all = await ctx.payload.find({ collection: "catalogues", limit: 0, pagination: false, depth: 0, req: ctx.req });
    const doc = all.docs.find((d) => norm(d.title) === norm(s.title));
    if (doc) {
      if (doc.order != null && !ctx.overwrite) return;
      await ctx.payload.update({ collection: "catalogues", id: doc.id, data: { order: s.order }, depth: 0, req: ctx.req });
      ctx.log(`  catalogue "${s.title}": order ${s.order}`);
      return;
    }
    const poster = await media(ctx, s.poster, s.title);
    const pdf = await document(ctx, s.pdf);
    if (!poster || !pdf) {
      ctx.log(`  ! catalogue "${s.title}": poster or PDF could not be uploaded, skipped`);
      return;
    }
    const brand = s.brand
      ? (await ctx.payload.find({ collection: "brands", where: { title: { equals: s.brand } }, limit: 1, depth: 0, req: ctx.req }))
          .docs[0]?.id
      : undefined;
    await ctx.payload.create({
      collection: "catalogues",
      data: {
        title: s.title,
        category: s.category ?? undefined,
        subcategory: s.subcategory ?? undefined,
        brand: brand ?? undefined,
        poster,
        document: pdf,
        order: s.order,
      },
      depth: 0,
      req: ctx.req,
    });
    ctx.log(`  created catalogue "${s.title}"`);
  },
);

// ---------- partner forms ----------

type PartnerJson = {
  banner: string | null;
  heading: string;
  intro: string;
  formTitle: string;
  sections: {
    title: string | null;
    level?: number;
    fields: {
      name: string;
      label: string;
      type?: string;
      required?: boolean;
      span?: number;
      options?: string[];
      accept?: string;
      hint?: string;
      showIf?: { field: string; value: string };
    }[];
  }[];
};
const partnerForms = partnerFormsJson as unknown as Record<PartnerKey, PartnerJson>;

const partnerTask = eachTask(
  "pages:partner-forms",
  "Partner forms (customers, dealer, vendors)",
  () => Object.keys(partnerForms) as PartnerKey[],
  async (ctx, key) => {
    const p = partnerForms[key];
    const m = partnerMeta[key];
    await upsert(ctx, "partnership", { slug: { equals: key } }, {
      title: m.crumb,
      slug: key,
      featuredImage: await media(ctx, p.banner, m.crumb),
      heading: p.heading,
      content: await lexical(ctx, p.intro),
      formTitle: p.formTitle,
      sections: p.sections.map((s) => ({
        title: s.title ?? "",
        level: s.level ? String(s.level) : null,
        fields: s.fields.map((f) => ({
          label: f.label,
          name: f.name,
          inputType: f.type ?? "text",
          span: String(f.span ?? 12),
          required: Boolean(f.required),
          options: f.options ?? [],
          accept: f.accept ?? "",
          hint: f.hint ?? "",
          showIf: { field: f.showIf?.field ?? "", value: f.showIf?.value ?? "" },
        })),
      })),
      meta: { title: seoTitle(m.title), description: m.description },
    });
  },
);

// ---------- legal pages ----------

type LegalJson = { meta: { title: string; description: string }; title: string; crumb: string; html: string };

const legalTask = eachTask(
  "pages:legal",
  "Legal pages (privacy policy, terms)",
  () => Object.entries(legalJson as Record<string, LegalJson>),
  async (ctx, [slug, p]) => {
    await upsert(ctx, "legal-pages", { slug: { equals: slug } }, {
      title: p.title,
      slug,
      crumb: p.crumb,
      content: await lexical(ctx, p.html),
      meta: { title: seoTitle(p.meta.title), description: p.meta.description },
    });
  },
);

// ---------- annual returns ----------

const returnDocs = () => annualReturnsJson.tabs.flatMap((t) => t.groups.flatMap((g) => g.docs));

export const pagesTasks: ImportTask[] = [
  onceTask("pages:services-page", "Services page (banner, SEO)", (ctx) =>
    fillGlobal(ctx, "services-page", async () => ({
      title: "Services",
      banner: await media(ctx, servicesIndex.banner, "Services"),
      meta: { title: seoTitle(servicesMeta.title), description: servicesMeta.description },
    })),
  ),
  serviceTask,
  onceTask("pages:catalogues-page", "Catalogues page (banner, category filter, SEO)", (ctx) =>
    fillGlobal(ctx, "catalogues-page", async () => ({
      title: "Catalogues",
      banner: await media(ctx, cataloguesJson.banner, "Catalogues"),
      categories: cataloguesJson.categories.map((value) => ({ value })),
      meta: { title: seoTitle(cataloguesJson.meta.title), description: cataloguesJson.meta.description },
    })),
  ),
  catalogueTask,
  partnerTask,
  legalTask,
  // PDFs first (one per step, they are fetched from the old site), then the page itself.
  eachTask("pages:annual-returns-files", "Annual returns PDFs", returnDocs, async (ctx, d) => {
    await document(ctx, d.href);
  }),
  onceTask("pages:annual-returns-page", "Annual returns page", (ctx) =>
    fillGlobal(ctx, "annual-returns-page", async () => ({
      banner: await media(ctx, annualReturnsJson.banner, "Annual Returns"),
      tabs: await mapSeq(annualReturnsJson.tabs, async (t) => ({
        label: t.label,
        groups: await mapSeq(t.groups, async (g) => ({
          title: g.title,
          docs: await mapSeq(g.docs, async (d) => ({ label: d.label, file: await document(ctx, d.href), href: d.href })),
        })),
      })),
      meta: { title: seoTitle(annualReturnsJson.meta.title), description: annualReturnsJson.meta.description },
    })),
  ),
];

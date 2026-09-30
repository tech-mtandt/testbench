import about from "@/content/scraped/about.json";
import career from "@/content/scraped/career.json";
import caseStudiesData from "@/content/scraped/case-studies.json";
import contact from "@/content/scraped/contact.json";
import industriesData from "@/content/scraped/industries.json";
import { sql } from "@payloadcms/db-postgres";
import { slugify } from "@/collections/Careers";
import { lexicalToText } from "@/lib/payload";

import { document, eachTask, fillGlobal, lexical, mapSeq, media, onceTask, pairs, texts, upsert } from "../helpers";
import type { ImportContext, ImportTask } from "../types";

// Meta titles are rendered verbatim, so the SEO tab gets the layout's " | MTandT" suffix
// to keep today's <title> unchanged.
const BRAND = " | MTandT";

type Card = { title: string; text: string; href: string | null; image: string | null };
type IndustryItem = {
  title: string;
  banner: string | null;
  heading: string;
  html: string;
  images: string[];
  gallery: { image: string; title: string }[];
  caseStudies: Card[];
  clients: string[];
};
type CaseStudyItem = {
  title: string;
  banner: string | null;
  blocks: { title: string; html: string }[];
  details: string[][];
  download: string | null;
  gallery: string[];
  related: Card[];
};

const industries = industriesData as unknown as {
  index: { title: string; text: string; href: string; icon: string | null }[];
  items: Record<string, IndustryItem>;
};
const caseStudies = Object.entries(caseStudiesData as unknown as Record<string, CaseStudyItem>);

/** Industries in listing order (the index), joined with their page content. */
const industryList = () =>
  industries.index
    .map((card, order) => {
      const slug = card.href.split("/").pop() ?? "";
      return { slug, order, card, item: industries.items[slug] };
    })
    .filter((x) => x.item);

const img = (ctx: ImportContext, src: string | null | undefined, alt?: string | null) => media(ctx, src, alt);
const imgs = async (ctx: ImportContext, list: (string | null)[], alt?: string) =>
  (await mapSeq(list, (src) => img(ctx, src, alt))).filter((id): id is number => id != null);
const cardData = (ctx: ImportContext, list: Card[]) =>
  mapSeq(list, async (c) => ({ title: c.title, text: c.text, link: c.href, image: await img(ctx, c.image, c.title) }));

/** Every file this area uploads, deduped; uploaded one per step so no step runs long. */
function files(): { src: string; alt: string; doc?: boolean }[] {
  const all: { src: string | null | undefined; alt: string; doc?: boolean }[] = [
    ...about.companies.map((c) => ({ src: c.icon, alt: c.title })),
    { src: about.why.image, alt: "Mtandt at work" },
    { src: about.why.bg, alt: about.why.title },
    { src: about.why.bullet, alt: "Bullet" },
    { src: about.journey.bg, alt: about.journey.title },
    { src: about.journey.road, alt: "Timeline" },
    ...about.journey.items.map((j) => ({ src: j.image, alt: `${j.year} ${j.title}` })),
    ...about.accreditations.logos.map((src) => ({ src, alt: "Divisional accreditation" })),
    { src: about.accreditations.bg, alt: about.accreditations.title },
    ...about.awards.images.map((src) => ({ src, alt: about.awards.title })),
    { src: career.banner, alt: "Careers" },
    ...career.images.map((src) => ({ src, alt: "Career Image" })),
    { src: contact.banner, alt: "Contact Us" },
    { src: contact.share.bg, alt: contact.share.title },
    ...industryList().flatMap(({ item: d }) => [
      { src: d.banner, alt: d.title },
      ...d.images.map((src) => ({ src, alt: d.title })),
      ...d.gallery.map((g) => ({ src: g.image, alt: g.title || d.title })),
      ...d.caseStudies.map((c) => ({ src: c.image, alt: c.title })),
      ...d.clients.map((src) => ({ src, alt: "Client logo" })),
    ]),
    ...caseStudies.flatMap(([, d]) => [
      { src: d.banner, alt: d.title },
      { src: d.download, alt: d.title, doc: true },
      ...d.gallery.map((src) => ({ src, alt: d.title })),
      ...d.related.map((c) => ({ src: c.image, alt: c.title })),
    ]),
  ];
  const seen = new Map<string, { src: string; alt: string; doc?: boolean }>();
  for (const f of all) if (f.src && !seen.has(f.src)) seen.set(f.src, f as { src: string; alt: string; doc?: boolean });
  return [...seen.values()];
}

// ---------- about (existing global: only empty fields are filled) ----------

async function importAbout(ctx: ImportContext) {
  const cur = (await ctx.payload.findGlobal({ slug: "about", depth: 0, req: ctx.req })) as Record<string, any>;
  const blank = (v: unknown) =>
    v == null ||
    v === "" ||
    (Array.isArray(v) && !v.length) ||
    (typeof v === "object" && !Array.isArray(v) && Object.values(v as object).every((x) => x == null || x === "" || (Array.isArray(x) && !x.length)));
  const data: Record<string, unknown> = {};
  // Sections added for the import: filled when empty, or replaced with overwrite on.
  const fill = async (key: string, build: () => unknown) => {
    if (ctx.overwrite || blank(cur?.[key])) data[key] = await build();
  };
  // Fields the live site already reads from this global: only ever filled when empty, so
  // an overwrite import never replaces what the site shows today.
  const fillExisting = async (key: string, build: () => unknown) => {
    if (blank(cur?.[key])) data[key] = await build();
  };

  await fillExisting("title", () => about.who.title);
  if (!cur?.content?.root?.children?.length) data.content = await lexical(ctx, about.who.html);
  await fillExisting("link", () => about.who.video);
  await fill("principlesTitle", () => about.principlesTitle);
  await fill("principles", () =>
    mapSeq(about.principles, async (p) => ({
      prefix: p.prefix,
      title: p.title,
      content: await lexical(ctx, p.html),
      icon: p.icon,
      art: p.art,
    })),
  );
  await fill("poweringProgressTitle", () => about.powering.title);
  await fillExisting("poweringProgressTagline", () => about.powering.tagline);
  await fillExisting("poweringProgressCards", () => about.powering.cards.map((c) => ({ label: c.label, description: c.description })));
  // The live DB's groupOfCompanies holds old rows the site never displayed (placeholders and
  // legacy joint ventures); the first import replaces them with what the page shows today.
  // companiesTitle doubles as the "imported" marker the page checks (see ui/About/data.ts).
  const firstCompanies = ctx.overwrite || blank(cur?.companiesTitle);
  await fill("companiesTitle", () => about.companiesTitle);
  if (firstCompanies)
    data.groupOfCompanies = await mapSeq(about.companies, async (c) => ({ title: c.title, link: c.href, icon: await img(ctx, c.icon, c.title) }));
  await fill("why", async () => ({
    title: about.why.title,
    points: about.why.points.map((value) => ({ value })),
    image: await img(ctx, about.why.image, "Mtandt at work"),
    background: await img(ctx, about.why.bg, about.why.title),
    bullet: await img(ctx, about.why.bullet, "Bullet"),
  }));
  await fill("journey", async () => ({
    title: about.journey.title,
    intro: about.journey.intro,
    background: await img(ctx, about.journey.bg, about.journey.title),
    road: await img(ctx, about.journey.road, "Timeline"),
    items: await mapSeq(about.journey.items, async (j) => ({
      year: j.year,
      title: j.title,
      text: j.text,
      image: await img(ctx, j.image, `${j.year} ${j.title}`),
    })),
  }));
  await fill("accreditations", async () => ({
    title: about.accreditations.title,
    text: about.accreditations.text,
    logos: await imgs(ctx, about.accreditations.logos, "Divisional accreditation"),
    background: await img(ctx, about.accreditations.bg, about.accreditations.title),
  }));
  await fill("awards", async () => ({
    title: about.awards.title,
    text: about.awards.text,
    images: await imgs(ctx, about.awards.images, about.awards.title),
  }));
  // SEO tab: copy the legacy meta only where the admin left it empty.
  const meta = { ...(cur?.meta ?? {}) };
  if (!meta.title) meta.title = about.meta.title + BRAND;
  if (!meta.description && about.meta.description) meta.description = about.meta.description;
  if (meta.title !== cur?.meta?.title || meta.description !== cur?.meta?.description) data.meta = meta;

  if (!Object.keys(data).length) return ctx.log("  skipped global about (already imported)");
  await ctx.payload.updateGlobal({ slug: "about", data: data as any, depth: 0, req: ctx.req });
  ctx.log(`  saved global about (${Object.keys(data).join(", ")})`);
}

// ---------- tasks ----------

export const companyTasks: ImportTask[] = [
  eachTask("company-files", "About, careers, industries, case studies & contact files", files, async (ctx, f) => {
    if (f.doc) await document(ctx, f.src);
    else await media(ctx, f.src, f.alt);
  }),

  onceTask("company-about", "About page", importAbout),

  onceTask("company-career-page", "Careers page", (ctx) =>
    fillGlobal(ctx, "career-page", async () => ({
      title: career.title,
      banner: await img(ctx, career.banner, "Careers"),
      heading: career.heading,
      tagline: career.tagline,
      content: await lexical(ctx, career.html),
      images: await imgs(ctx, career.images, "Career Image"),
      form: {
        title: career.form.title,
        subtitle: career.form.subtitle,
        functionalAreas: texts(career.form.functionalAreas),
        education: texts(career.form.education),
      },
      // Today's hardcoded metadata (career.json's meta is just "Career").
      meta: {
        title: "Careers | Mtandt Group" + BRAND,
        description:
          "Join Mtandt Group - for the ones who get it done, Dil Se. Explore current openings and apply with your resume.",
      },
    })),
  ),

  eachTask("company-careers", "Job openings", () => career.jobs, async (ctx, job, i) => {
    const slug = slugify(job.title);
    await upsert(ctx, "careers", { slug: { equals: slug } }, {
      title: job.title,
      slug,
      description: await lexical(ctx, job.html),
      isOpen: true,
      order: i,
    });
  }),

  onceTask("company-industries-page", "Industries page", (ctx) =>
    fillGlobal(ctx, "industries-page", async () => ({
      title: "",
      meta: {
        title: "Industries" + BRAND,
        description:
          "Industries served by Mtandt Group: railway, aviation, automobile, energy, hotels & buildings, FMCG/warehouses and events.",
      },
    })),
  ),

  eachTask("company-industries", "Industries", industryList, async (ctx, { slug, order, card, item: d }) => {
    await upsert(ctx, "industries", { slug: { equals: slug } }, {
      title: d.title || card.title,
      slug,
      order,
      cardText: card.text,
      icon: card.icon,
      banner: await img(ctx, d.banner, d.title),
      heading: d.heading,
      content: await lexical(ctx, d.html),
      images: await imgs(ctx, d.images, d.title),
      gallery: (
        await mapSeq(d.gallery, async (g) => ({ image: await img(ctx, g.image, g.title || d.title), title: g.title }))
      ).filter((g) => g.image != null),
      caseStudies: await cardData(ctx, d.caseStudies),
      clients: await imgs(ctx, d.clients, "Client logo"),
      meta: { title: `${d.title} Industry${BRAND}`, description: d.heading || undefined },
    });
  }),

  eachTask("company-case-studies", "Case studies", () => caseStudies, async (ctx, [slug, d]) => {
    await upsert(ctx, "case-studies", { slug: { equals: slug } }, {
      title: d.title,
      slug,
      banner: await img(ctx, d.banner, d.title),
      blocks: await mapSeq(d.blocks, async (b) => ({ title: b.title, content: await lexical(ctx, b.html) })),
      details: pairs(d.details),
      download: await document(ctx, d.download),
      gallery: await imgs(ctx, d.gallery, d.title),
      related: await cardData(ctx, d.related),
      meta: {
        title: d.title + BRAND,
        description: d.blocks[0]?.html.replace(/<[^>]+>/g, "").slice(0, 160) || undefined,
      },
    });
  }),

  onceTask("company-contact-page", "Contact page", async (ctx) => {
    const legacy = await readLegacyContact(ctx);
    await fillGlobal(ctx, "contact-page", async () => ({
      title: "Contact Us",
      banner: await img(ctx, contact.banner, "Contact Us"),
      heading: legacy?.title || contact.heading,
      subheading: contact.subheading,
      share: {
        title: contact.share.title,
        text: contact.share.text,
        button: contact.share.button,
        background: await img(ctx, contact.share.bg, contact.share.title),
        formTitle: contact.share.formTitle,
        fields: contact.share.fields.map((f) => ({
          name: f.name,
          label: f.label,
          type: ("type" in f && f.type) || "text",
          required: Boolean(f.required),
          options: "options" in f ? texts(f.options) : [],
        })),
      },
      regions: contact.regions.map((r) => ({
        name: r.name,
        cities: r.cities.map((c) => ({
          name: c.name,
          offices: c.offices.map((o) => {
            const d = legacy?.locations.find((l) => l.label.toLowerCase() === o.label.toLowerCase());
            return {
              company: d?.company || o.company,
              label: o.label,
              address: d?.address || o.address,
              phones: d?.phones.length ? d.phones : texts(o.phones),
              emails: d?.emails.length ? d.emails : texts(o.emails),
              map: o.map,
            };
          }),
        })),
      })),
      meta: { title: contact.meta.title + BRAND, description: contact.meta.description },
    }));
  }),
];

/**
 * Edits saved in the old (drifted, now hidden) `contact` global, which the live Contact page
 * laid over the scraped offices by label. Read with raw SQL exactly as the old page did
 * (findGlobal throws on the drifted tables) so the import keeps them. Null when absent.
 */
async function readLegacyContact(ctx: ImportContext) {
  try {
    const db = (ctx.payload.db as unknown as { drizzle?: { execute: (q: unknown) => Promise<{ rows: Record<string, unknown>[] }> } }).drizzle;
    if (!db) return null;
    const [head, locs, textRows] = await Promise.all([
      db.execute(sql`select title from contact limit 1`),
      db.execute(sql`select _order, title, label, address from contact_locations order by _order`),
      db.execute(sql`select "order", path, text from contact_texts order by "order"`),
    ]);
    const byPath = (p: string) => textRows.rows.filter((t) => t.path === p).map((t) => String(t.text));
    return {
      title: (head.rows[0]?.title as string) || null,
      locations: locs.rows.map((l, i) => ({
        label: String(l.label ?? ""),
        company: (l.title as string) || null,
        address: lexicalToText(l.address, 1000) || null,
        phones: byPath(`locations.${i}.phones`),
        emails: byPath(`locations.${i}.emails`),
      })),
    };
  } catch (err) {
    ctx.log(`  (no legacy contact data: ${(err as Error).message.split("\n")[0]})`);
    return null;
  }
}

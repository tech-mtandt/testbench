import home from "@/content/scraped/home.json";
import { catalog, categoryHref } from "@/content/catalog";
import { blogHero, events } from "@/content/media";
import { productTiles, servicesMenu } from "@/content/nav";
import { servicesIndex } from "@/content/services";
import { lexicalToText, payloadClient } from "@/lib/payload";
import BrandTabs from "@/ui/Home/BrandTabs";
import { BuyRent, CategoryBento, ClientsStrip, Latest, ServicePillars, WhyUs } from "@/ui/Home/Blocks";
import Hero from "@/ui/Home/Hero";
import Testimonials from "@/ui/Home/Testimonials";
import { Section, SectionHeader } from "@/ui/kit/Section";

export const revalidate = 600;

const slideTargets = [
  categoryHref("aerial-work-platform"),
  categoryHref("material-handling-equipment"),
  categoryHref("aluminium-scaffold"),
  categoryHref("fall-protection-lifeline-systems"),
  categoryHref("temporary-road-mats"),
  categoryHref("tools-and-supplies"),
  "/services/cesl",
];

async function latestBlogs() {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "blogs",
      where: { _status: { equals: "published" } },
      sort: "-publishedDate",
      limit: 3,
      depth: 1,
    });
    return docs.map((b) => ({
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt || lexicalToText(b.body, 140),
      date: b.publishedDate ?? b.createdAt,
      image: blogHero(b) ?? null,
      category: b.category ?? null,
    }));
  } catch (err) {
    console.error("[home] blogs query failed", err);
    return [];
  }
}

export default async function Home() {
  const blogs = await latestBlogs();
  const since = new Date().getFullYear() - 1974;

  const pillars = servicesMenu.map((g) => {
    const slug = g.href?.split("/").pop();
    const s = servicesIndex.items.find((x) => x.slug === slug);
    return { title: g.title, href: g.href ?? "/services", text: s?.excerpt ?? "", image: s?.image ?? null, links: g.links };
  });

  const recentEvents = [...events]
    .sort((a, b) => (b.from ?? "").localeCompare(a.from ?? ""))
    .map((e) => ({ href: `/event/${e.slug}`, title: e.title, date: e.from }));

  return (
    <>
      <Hero
        slides={home.slides.map((s, i) => ({ ...s, href: slideTargets[i] ?? "/products" }))}
        quick={[
          { label: "Scissor lifts", href: categoryHref("aerial-work-platform", { sub: "scissor-lift" }) },
          { label: "Boom lifts", href: categoryHref("aerial-work-platform", { sub: "boom-lift" }) },
          { label: "Spider lifts", href: categoryHref("aerial-work-platform", { sub: "spider-lift" }) },
          { label: "Scaffolding", href: categoryHref("aluminium-scaffold") },
          { label: "Rent", href: "/products?mode=rent" },
        ]}
        stats={[
          { value: `${since} yrs`, label: "Serving industry since 1974" },
          { value: "5,000+", label: "Customers across SAARC" },
          { value: "5M+", label: "Man-days of experience" },
          { value: String(catalog.length), label: "Machines & systems" },
        ]}
      />
      <CategoryBento tiles={productTiles} />
      <BuyRent />
      <ServicePillars pillars={pillars} />
      <Section>
        <SectionHeader
          eyebrow="Group & partner brands"
          title="Seven business units. Twenty-plus global partners."
          description="Safety and excellence across diverse needs and applications."
        />
        <BrandTabs tabs={home.brandTabs} />
      </Section>
      <WhyUs items={home.whyUs} />
      <ClientsStrip logos={home.clients.filter((c): c is string => Boolean(c))} />
      <Testimonials items={home.testimonials} />
      <Latest blogs={blogs} events={recentEvents} />
    </>
  );
}

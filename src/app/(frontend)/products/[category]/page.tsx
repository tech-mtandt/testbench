import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowDown } from "lucide-react";
import { catalogCategories, categoryImage, getItemByLegacySlug, itemsInCategory } from "@/content/catalog";
import { getCategory } from "@/content/products";
import {
  canonicalCategory,
  catalogView,
  categoryLabel,
  isSystemCategory,
  parseFilters,
  plainText,
  productTarget,
  toCard,
  type SearchParams,
} from "@/content/catalog-view";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import { Section, SectionHeader } from "@/ui/kit/Section";
import { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import CatalogBrowser from "@/ui/Catalog/CatalogBrowser";
import { SystemCard } from "@/ui/Catalog/ProductCard";
import ServicesCta from "@/ui/Catalog/ServicesCta";
import SubGuide from "@/ui/Catalog/SubGuide";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<SearchParams> };

export const generateStaticParams = () => catalogCategories.map((c) => ({ category: c.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return {
    title: cat.meta.title || `${categoryLabel(cat.slug)} — buy or rent`,
    description: cat.meta.description || plainText(cat.intro).slice(0, 160),
    keywords: cat.meta.keywords,
    alternates: { canonical: `/products/${cat.slug}` },
  };
}

const excerpt = (t: string, n: number) => (t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t);

const qs = (sp: SearchParams) => {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) for (const x of [v].flat()) if (x) u.append(k, x);
  const s = u.toString();
  return s ? `?${s}` : "";
};

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const cat = getCategory(category);
  if (!cat) {
    // legacy aliases and the old /products/[db-slug] URLs
    const alias = canonicalCategory(category);
    if (alias) permanentRedirect(`/products/${alias}${qs(sp)}`);
    if (getItemByLegacySlug(category)) permanentRedirect(productTarget(category)!);
    notFound();
  }

  const items = itemsInCategory(cat.slug);
  const system = isSystemCategory(cat.slug);
  const view = catalogView(parseFilters(sp, { category: cat.slug }));
  const sub = cat.subcategories.find((s) => s.slug === view.filters.sub) ?? null;
  const rent = items.some((i) => i.modes.includes("rent"));
  const image = (sub && items.find((i) => i.subcategory === sub.slug && i.image)?.image) || categoryImage(cat.slug);
  const name = categoryLabel(cat.slug);
  const crumbs = [{ label: "Equipment", href: "/products" }, { label: name, href: sub ? `/products/${cat.slug}` : undefined }, ...(sub ? [{ label: sub.name }] : [])];

  const aside = system ? (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-line">
      <Img src={image ?? undefined} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
      <p className="absolute bottom-5 left-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/80">{items.length} systems</p>
    </div>
  ) : (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white">
      <Img src={image ?? undefined} alt="" loading="eager" className="absolute inset-0 h-full w-full object-contain p-10 mix-blend-multiply" />
    </div>
  );

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={`${items.length} ${system ? "systems" : "models"} · ${rent ? "Buy & rent" : "Buy"}`}
        title={sub && !system ? sub.name : name}
        description={sub && !system && sub.html ? excerpt(plainText(sub.html), 300) : plainText(cat.intro)}
        aside={aside}
        actions={
          <>
            <a href="#results" className={buttonClass("dark", "lg")}>
              {system ? "Explore systems" : "Browse models"} <ArrowDown className="h-4 w-4" />
            </a>
            <EnquireButton subject={sub?.name ?? name} source={`category:${cat.slug}`} className={buttonClass("primary", "lg")}>
              Request a quote
            </EnquireButton>
          </>
        }
      />

      {system ? (
        <Section tight id="results" className="scroll-mt-24">
          <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((it, i) => (
              <StaggerItem key={it.slug} className="min-w-0">
                <SystemCard item={toCard(it)} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : (
        <section className="scroll-mt-24 pb-8">
          <CatalogBrowser view={view} scope={cat.slug} resetHref={`/products/${cat.slug}`} />
        </section>
      )}

      <Section id="guide">
        <SectionHeader
          eyebrow="Buying guide"
          title={system ? `Choosing the right ${name.toLowerCase()}` : `Know your ${name.toLowerCase()}`}
          description="What each product line does best, and answers to the questions our engineers hear most."
        />
        <SubGuide subs={cat.subcategories} initial={view.filters.sub} />
      </Section>

      <ServicesCta category={cat.slug} />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, listingHref } from "@/content/products";
import { Breadcrumbs } from "@/ui/PageChrome";
import CategoryTabs from "@/ui/Products/CategoryTabs";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = getCategory((await params).category);
  if (!c) return {};
  return {
    title: { absolute: c.meta.title || c.title },
    description: c.meta.description,
    keywords: c.meta.keywords,
    alternates: { canonical: `/category-by-subcategory/${c.slug}` },
  };
}

export default async function Page({ params }: Params) {
  const c = getCategory((await params).category);
  if (!c) notFound();
  const tabs = c.subcategories.map((s) => ({
    ...s,
    buyHref: listingHref("buy", c.slug, s.slug),
    rentHref: listingHref("rental", c.slug, s.slug),
  }));
  return (
    <div className="default-margin pb-12">
      <div className="py-3">
        <Breadcrumbs items={[{ label: c.crumb || c.title }]} />
      </div>
      <header className="mx-auto max-w-4xl pt-8 pb-8 text-center">
        <h1 className="text-2xl font-semibold text-ink md:text-[28px]">{c.title}</h1>
        {c.intro && <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">{c.intro}</p>}
      </header>
      <div className="mx-auto max-w-[1140px]">
        <CategoryTabs tabs={tabs} />
      </div>
    </div>
  );
}

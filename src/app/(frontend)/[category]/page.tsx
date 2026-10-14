import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { categoryHref, getCategories, getCategory, listingHref, subcategoryHref } from "@/content/products";
import { modernizeHref } from "@/content/urls";
import Link from "next/link";
import { landingConfig, oldLandingPaths } from "@/content/landing";
import { Breadcrumbs } from "@/ui/PageChrome";
import CategoryTabs from "@/ui/Products/CategoryTabs";

type Params = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCategory((await params).category);
  if (!c) return {};
  return {
    title: { absolute: c.meta.title || c.title },
    description: c.meta.description,
    keywords: c.meta.keywords,
    alternates: { canonical: categoryHref(c.slug) },
    openGraph: c.meta.image ? { images: [c.meta.image] } : undefined,
  };
}

export default async function Page({ params }: Params) {
  const { category } = await params;
  const c = await getCategory(category);
  if (!c) {
    const old = oldLandingPaths[`/${category}`];
    if (old) permanentRedirect(old);
    redirectLegacy(`/category-by-subcategory/${category}`);
    notFound();
  }
  const tabs = c.subcategories.map((s) => ({
    ...s,
    button: s.button && { ...s.button, href: s.button.href && modernizeHref(s.button.href) },
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
        <nav aria-label={`${c.title} ranges`} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {c.subcategories.map((s) => {
            return (
              <Link
                key={s.slug}
                href={subcategoryHref(c.slug, s.slug)}
                className="border-l-4 border-brand bg-[#f2f2f2] px-4 py-3 text-sm font-semibold text-ink no-underline hover:bg-brand-cream"
              >
                {landingConfig(c.slug, s.slug)?.label ?? s.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

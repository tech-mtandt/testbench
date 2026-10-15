import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getCatalogues } from "@/content/catalogues";
import { enquiryFields } from "@/content/forms";
import { landingConfig, oldLandingPaths } from "@/content/landing";
import { redirectLegacy } from "@/content/legacy-redirects";
import {
  categoryHref,
  getCategories,
  getCategory,
  getListing,
  listingHref,
  resolveSegments,
  subcategoryHref,
} from "@/content/products";
import { contact } from "@/content/site";
import { categorySegment, modernizeHref } from "@/content/urls";
import LeadForm from "@/ui/Forms/LeadForm";
import Img from "@/ui/Img";
import BrochureButton from "@/ui/Landing/BrochureButton";
import LeadPopup from "@/ui/Landing/LeadPopup";
import { Breadcrumbs } from "@/ui/PageChrome";
import CategoryTabs from "@/ui/Products/CategoryTabs";

/**
 * Category landing page (/<category>): hero with CTAs, a card per range linking to its
 * landing page and buy/rent listings, the range write-ups and FAQs, the lead popup and an
 * enquiry form.
 */

type Params = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: categorySegment(c.slug) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCategory(resolveSegments((await params).category).category);
  if (!c) return {};
  return {
    title: { absolute: c.meta.title || `${c.title} for Sale & Rent | Mtandt` },
    description: c.meta.description || c.intro || undefined,
    keywords: c.meta.keywords,
    alternates: { canonical: categoryHref(c.slug) },
    openGraph: c.meta.image ? { images: [c.meta.image] } : undefined,
  };
}

export default async function Page({ params }: Params) {
  const seg = (await params).category;
  const { category, canonical } = resolveSegments(seg);
  const c = await getCategory(category);
  if (!c) {
    const old = oldLandingPaths[`/${seg}`];
    if (old) permanentRedirect(old);
    redirectLegacy(`/category-by-subcategory/${seg}`);
    notFound();
  }
  if (!canonical) permanentRedirect(categoryHref(c.slug));

  const ranges = await Promise.all(
    c.subcategories.map(async (s) => {
      const [buy, rent] = await Promise.all([getListing("buy", c.slug, s.slug), getListing("rental", c.slug, s.slug)]);
      const buyCount = buy?.products.length ?? 0;
      const rentCount = rent?.products.length ?? 0;
      return {
        slug: s.slug,
        label: landingConfig(c.slug, s.slug)?.label ?? s.name,
        image: buy?.products[0]?.image ?? rent?.products[0]?.image ?? null,
        buyCount,
        rentCount,
      };
    }),
  );
  const tabs = c.subcategories.map((s) => ({
    ...s,
    button: s.button && { ...s.button, href: s.button.href && modernizeHref(s.button.href) },
    buyHref: listingHref("buy", c.slug, s.slug),
    rentHref: listingHref("rental", c.slug, s.slug),
  }));

  const page = categoryHref(c.slug).slice(1);
  // Brochure: the first catalogue (admin > Catalogues) whose title names this category.
  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const brochure = (await getCatalogues().catch(() => [])).find(
    (x) => norm(x.title).includes(norm(c.title)) && x.documentUrl,
  );
  const fields = enquiryFields.filter((f) => f.name !== "product");

  return (
    <>
      <LeadPopup product={c.title} page={page} />
      <div className="default-margin py-3">
        <Breadcrumbs items={[{ label: c.crumb || c.title }]} />
      </div>

      <section className="bg-ink text-white">
        <div className="default-margin py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Buy &amp; Rent</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold uppercase text-white md:text-5xl">{c.title}</h1>
          {c.intro && <p className="mt-5 max-w-3xl text-base text-white/80 md:text-lg">{c.intro}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className="btn-yellow no-underline">
              Get a Quote
            </a>
            <a
              href={contact.phoneHref}
              className="rounded border border-white px-5 py-2.5 text-sm font-semibold text-white no-underline"
            >
              Call {contact.phone}
            </a>
            <BrochureButton
              title={`${c.title} Brochure`}
              href={brochure?.documentUrl ?? null}
              page={page}
              className="inline-flex items-center gap-2 rounded border border-brand px-5 py-2.5 text-sm font-semibold text-brand"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="default-margin">
          <h2 className="mb-6 text-xl font-semibold uppercase text-ink md:text-2xl">Our {c.title} Range</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ranges.map((r) => (
              <div key={r.slug} className="flex flex-col overflow-hidden rounded-md bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                <Link href={subcategoryHref(c.slug, r.slug)} className="flex flex-1 flex-col no-underline">
                  <div className="flex h-44 items-center justify-center bg-[#f7f7f7] p-4">
                    {r.image ? (
                      <Img src={r.image} alt={r.label} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-3xl font-semibold uppercase text-ink/20">{r.label}</span>
                    )}
                  </div>
                  <h3 className="border-t-4 border-brand px-4 pt-3 text-base font-semibold uppercase text-ink">{r.label}</h3>
                </Link>
                <div className="flex gap-4 px-4 pt-2 pb-4 text-sm">
                  {r.buyCount > 0 && (
                    <Link href={listingHref("buy", c.slug, r.slug)} className="font-semibold text-ink underline">
                      Buy ({r.buyCount})
                    </Link>
                  )}
                  {r.rentCount > 0 && (
                    <Link href={listingHref("rental", c.slug, r.slug)} className="font-semibold text-ink underline">
                      Rent ({r.rentCount})
                    </Link>
                  )}
                  {!r.buyCount && !r.rentCount && (
                    <Link href={subcategoryHref(c.slug, r.slug)} className="font-semibold text-ink underline">
                      Learn more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f2f2f2] py-12 md:py-16">
        <div className="default-margin mx-auto max-w-[1140px]">
          <h2 className="mb-6 text-xl font-semibold uppercase text-ink md:text-2xl">About {c.title}</h2>
          <CategoryTabs tabs={tabs} />
        </div>
      </section>

      <section id="enquire" className="scroll-mt-24 bg-white py-12 md:py-16">
        <div className="default-margin">
          <div className="rounded-md bg-[#f2f2f2] px-5 py-8 md:px-9 md:py-11">
            <h2 className="text-2xl font-medium uppercase text-ink md:text-[28px]">Enquire about {c.title}</h2>
            <p className="mt-2 mb-6 text-sm text-ink/80">
              Tell us about your site and our team will recommend the right equipment to buy or rent.
            </p>
            <LeadForm form="enquiry" fields={fields} hidden={{ product: c.title, page }} submitLabel="Request a Quote" />
          </div>
        </div>
      </section>
    </>
  );
}

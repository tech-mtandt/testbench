import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getCatalogues } from "@/content/catalogues";
import { brandFacts, categoryTagline, landingConfig, landingMedia, oldLandingPaths } from "@/content/landing";
import { redirectLegacy } from "@/content/legacy-redirects";
import {
  categoryHref,
  getCategories,
  getCategory,
  getListing,
  resolveSegments,
  subcategoryHref,
} from "@/content/products";
import { getSite } from "@/content/site";
import { categorySegment, modernizeHref } from "@/content/urls";
import Img from "@/ui/Img";
import BrochureButton from "@/ui/Landing/BrochureButton";
import LandingHero from "@/ui/Landing/LandingHero";
import LeadPopup from "@/ui/Landing/LeadPopup";
import AboutFaq from "@/ui/Landing/AboutFaq";
import QuoteBand from "@/ui/Landing/QuoteBand";

/**
 * Category landing page (/<category>), shared landing template: video hero, a card per range
 * (linking to its landing page), about + FAQs, the lead popup and the quote section.
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

  const site = await getSite();
  const ranges = await Promise.all(
    c.subcategories.map(async (s) => {
      const [buy, rent] = await Promise.all([getListing("buy", c.slug, s.slug), getListing("rental", c.slug, s.slug)]);
      const models = new Set([...(buy?.products ?? []), ...(rent?.products ?? [])].map((p) => p.model || p.title)).size;
      // Ranges without catalogue products are presented on their solution page.
      const solution = !models && s.button?.href ? modernizeHref(s.button.href) : null;
      return {
        slug: s.slug,
        label: landingConfig(c.slug, s.slug)?.label ?? s.name,
        image: buy?.products[0]?.image ?? rent?.products[0]?.image ?? null,
        models,
        href: solution ?? subcategoryHref(c.slug, s.slug),
      };
    }),
  );
  const faqs = c.subcategories.flatMap((s) => s.faqs).slice(0, 8);
  const page = categoryHref(c.slug).slice(1);
  // Brochure: the first catalogue (admin > Catalogues) whose title names this category.
  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const brochure = (await getCatalogues().catch(() => [])).find(
    (x) => norm(x.title).includes(norm(c.title)) && x.documentUrl,
  );

  return (
    <>
      <LeadPopup product={c.title} page={page} />
      <LandingHero
        eyebrow="Buy & rent"
        title={c.title}
        subtitle={categoryTagline(c.slug) ?? c.intro.split(/(?<=\.)\s/)[0]}
        crumbs={[{ label: c.crumb || c.title }]}
        media={landingMedia(c.slug)}
        phone={{ label: site.contact.phone, href: site.contact.phoneHref }}
        brochure={
          <BrochureButton
            title={`${c.title} Brochure`}
            href={brochure?.documentUrl ?? null}
            page={page}
            className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-brand underline-offset-4 hover:underline"
          />
        }
        facts={brandFacts}
      />

      <section className="bg-white py-16 md:py-24">
        <div className="default-margin">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">Explore the range</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">Choose your {c.title.toLowerCase()}</h2>
          <ul className={`mt-10 grid gap-5 sm:grid-cols-2 ${ranges.length === 3 ? "lg:grid-cols-3" : ranges.length <= 2 ? "" : "lg:grid-cols-4"}`}>
            {ranges.map((r) => (
              <li key={r.slug}>
                <Link
                  href={r.href}
                  className="group flex h-full flex-col overflow-hidden rounded-md bg-white no-underline ring-1 ring-black/10 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-black/20"
                >
                  <div className="relative flex aspect-[16/10] items-center justify-center bg-surface sm:aspect-[4/3]">
                    {r.image ? (
                      <Img src={r.image} alt={r.label} sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="absolute inset-0 h-full w-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="text-center text-2xl font-semibold uppercase tracking-tight text-ink/15">{r.label}</span>
                    )}
                  </div>
                  <div className="flex flex-1 items-end justify-between gap-3 p-5">
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-ink">{r.label}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{r.models ? `${r.models} model${r.models === 1 ? "" : "s"} · buy or rent` : "Solutions & enquiries"}</p>
                    </div>
                    <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AboutFaq title={c.title} html={c.intro ? `<p>${escapeHtml(c.intro)}</p>` : ""} faqs={faqs} />

      <QuoteBand title={`Tell us what your site needs`} product={c.title} page={page} contact={site.contact} />
    </>
  );
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

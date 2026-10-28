import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogues } from "@/content/catalogues";
import { brandFacts, findBrochure, landingConfig } from "@/content/landing";
import { getLanding } from "@/content/landingPages";
import {
  categoryHref,
  getCategory,
  getListing,
  listingHref,
  resolveSegments,
  subcategoryHref,
} from "@/content/products";
import { getSite } from "@/content/site";
import { modernizeHref } from "@/content/urls";
import BrochureButton from "@/ui/Landing/BrochureButton";
import LeadPopup from "@/ui/Landing/LeadPopup";
import Img from "@/ui/Img";
import AboutFaq from "@/ui/Landing/AboutFaq";
import LandingHero from "@/ui/Landing/LandingHero";
import ModelShowcase from "@/ui/Landing/ModelShowcase";
import { rangeModels } from "@/ui/Landing/modelCards";
import QuoteBand from "@/ui/Landing/QuoteBand";

/**
 * Range landing page at /<category>/<subcategory> (shared landing template): video hero,
 * the models with a Buy/Rent switch and height slider, about + FAQs, sibling ranges and the
 * quote section.
 * Ranges with campaign copy in `@/content/landing` (boom and scissor lifts) also get the lead
 * popup and an always-on brochure button. Banner video and text: admin > Landing pages.
 */

export type HubParams = { params: Promise<{ category: string; subcategory: string }> };

async function load(cat: string, sub: string) {
  const [category, buy, rent, landing] = await Promise.all([
    getCategory(cat),
    getListing("buy", cat, sub),
    getListing("rental", cat, sub),
    getLanding(`${cat}/${sub}`),
  ]);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return null;
  return { category, subcategory, buy, rent, landing, config: landingConfig(cat, sub) };
}

export async function hubMetadata({ params }: HubParams): Promise<Metadata> {
  const p = await params;
  const { category, subcategory } = resolveSegments(p.category, p.subcategory);
  const h = await load(category, subcategory);
  if (!h) return {};
  const meta = [h.buy?.meta, h.rent?.meta].find((m) => m?.title || m?.description) ?? {};
  const hasProducts = Boolean(h.buy?.products.length || h.rent?.products.length);
  // Ranges without catalogue products (fall protection, road mats, tools…) are presented on
  // their solution page; point search engines there instead of at this thin hub.
  const solution = !hasProducts && h.subcategory.button?.href ? modernizeHref(h.subcategory.button.href) : null;
  const description = h.landing.metaDescription || meta.description || h.buy?.description || h.rent?.description;
  return {
    title: {
      absolute: h.landing.metaTitle || meta.title || `${h.subcategory.name}${hasProducts ? " for Sale & Rent" : ""} | Mtandt`,
    },
    description: description || `${h.subcategory.name} from Mtandt Group: ${h.category.title.toLowerCase()} for sale and rent across India.`,
    keywords: meta.keywords,
    alternates: { canonical: solution?.startsWith("/") ? solution : subcategoryHref(category, subcategory) },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}


/** Returns null when the category/subcategory doesn't exist (the route then 404s). */
export default async function SubcategoryHub({ category: cat, subcategory: sub }: { category: string; subcategory: string }) {
  const h = await load(cat, sub);
  if (!h) return null;
  const { category, subcategory, buy, rent, landing, config: c } = h;

  const name = subcategory.name;
  const label = c?.label ?? name;
  const product = c?.product ?? name;
  const page = subcategoryHref(cat, sub).slice(1);
  const site = await getSite();

  // Brochure: the first catalogue (admin > Catalogues) whose title names this range, e.g. "Boom Lift
  // Brochure", else the category's (findBrochure).
  const brochure = findBrochure(await getCatalogues().catch(() => []), cat, [product]);
  const siblings = await Promise.all(
    category.subcategories
      .filter((s) => s.slug !== sub)
      .map(async (s) => {
        const [b, r] = await Promise.all([getListing("buy", cat, s.slug), getListing("rental", cat, s.slug)]);
        return { slug: s.slug, label: landingConfig(cat, s.slug)?.label ?? s.name, image: b?.products[0]?.image ?? r?.products[0]?.image ?? null };
      }),
  );

  return (
    <>
      {c && <LeadPopup product={product} page={page} />}
      <LandingHero
        eyebrow={category.title}
        title={landing.headline ?? label}
        subtitle={landing.intro ?? `${label} to buy or rent from Mtandt, with delivery, operator training and service support.`}
        crumbs={[{ label: category.crumb || category.title, href: categoryHref(cat) }, { label }]}
        media={landing.media}
        phone={{ label: site.contact.phone, href: site.contact.phoneHref }}
        brochure={
          (c || brochure) && (
            <BrochureButton
              title={`${product} Brochure`}
              href={brochure?.documentUrl ?? null}
              page={page}
              className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            />
          )
        }
        facts={landing.facts ?? brandFacts}
      />

      <ModelShowcase
        label={label}
        models={rangeModels(buy, rent)}
        listings={{ buy: listingHref("buy", cat, sub), rent: listingHref("rental", cat, sub) }}
      />

      <AboutFaq title={label} html={subcategory.html} faqs={subcategory.faqs} />

      {siblings.length > 0 && (
        <section className="bg-white py-14 md:py-20">
          <div className="default-margin">
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">More {category.title.toLowerCase()}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              {siblings.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={subcategoryHref(cat, s.slug)}
                    className="group flex items-center gap-3 rounded-md p-3 no-underline ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-surface p-1.5">
                      <Img src={s.image ?? undefined} alt="" sizes="56px" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-ink">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <QuoteBand title={`Find the right ${product.toLowerCase()} for your site`} product={product} page={page} contact={site.contact} />
    </>
  );
}

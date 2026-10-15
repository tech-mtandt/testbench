import type { Metadata } from "next";
import Link from "next/link";
import { getCatalogues } from "@/content/catalogues";
import { enquiryFields } from "@/content/forms";
import { landingConfig } from "@/content/landing";
import {
  categoryHref,
  getCategory,
  getListing,
  listingHref,
  productHref,
  resolveSegments,
  subcategoryHref,
  type CatalogProduct,
} from "@/content/products";
import { contact } from "@/content/site";
import { modernizeHref } from "@/content/urls";
import LeadForm from "@/ui/Forms/LeadForm";
import BrochureButton from "@/ui/Landing/BrochureButton";
import LeadPopup from "@/ui/Landing/LeadPopup";
import { Breadcrumbs } from "@/ui/PageChrome";
import Faqs from "@/ui/Products/Faqs";
import ProductCard from "@/ui/Products/ProductCard";

/**
 * Range hub at /<category>/<subcategory>: hero with CTAs, buy + rental models, the range
 * write-up and FAQs, sibling ranges and an enquiry form. Ranges with campaign copy in
 * `@/content/landing` (boom and scissor lifts) also get selling points, the lead popup and
 * a brochure button.
 */

export type HubParams = { params: Promise<{ category: string; subcategory: string }> };

const MAX_MODELS = 8;

async function load(cat: string, sub: string) {
  const [category, buy, rent] = await Promise.all([
    getCategory(cat),
    getListing("buy", cat, sub),
    getListing("rental", cat, sub),
  ]);
  const subcategory = category?.subcategories.find((s) => s.slug === sub);
  if (!category || !subcategory) return null;
  return { category, subcategory, buy, rent, config: landingConfig(cat, sub) };
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
  const description = h.config?.metaDescription || meta.description || h.buy?.description || h.rent?.description;
  return {
    title: {
      absolute: h.config?.metaTitle || meta.title || `${h.subcategory.name}${hasProducts ? " for Sale & Rent" : ""} | Mtandt`,
    },
    description: description || `${h.subcategory.name} from Mtandt Group: ${h.category.title.toLowerCase()} for sale and rent across India.`,
    keywords: meta.keywords,
    alternates: { canonical: solution?.startsWith("/") ? solution : subcategoryHref(category, subcategory) },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}

function Models({ title, products, href }: { title: string; products: CatalogProduct[]; href: string }) {
  if (!products.length) return null;
  return (
    <div className="mt-10 first:mt-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-semibold uppercase text-ink md:text-2xl">{title}</h2>
        <Link href={href} className="text-sm font-semibold text-ink underline">
          View all {products.length} models
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, MAX_MODELS).map((p) => (
          <ProductCard key={p.slug} href={productHref(p)} title={p.title} image={p.image} />
        ))}
      </div>
    </div>
  );
}

/** Returns null when the category/subcategory doesn't exist (the route then 404s). */
export default async function SubcategoryHub({ category: cat, subcategory: sub }: { category: string; subcategory: string }) {
  const h = await load(cat, sub);
  if (!h) return null;
  const { category, subcategory, buy, rent, config: c } = h;

  const name = subcategory.name;
  const label = c?.label ?? name;
  const product = c?.product ?? name;
  const path = subcategoryHref(cat, sub);
  const page = path.slice(1);
  const categoryLabel = category.crumb || category.title;

  // Brochure: the first catalogue (admin > Catalogues) whose title names this range, e.g. "Boom Lift Brochure".
  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const catalogues = await getCatalogues().catch(() => []);
  const brochure = catalogues.find((x) => norm(x.title).includes(norm(product)) && x.documentUrl);
  const siblings = category.subcategories.filter((s) => s.slug !== sub);
  const fields = enquiryFields.filter((f) => f.name !== "product");

  return (
    <>
      {c && <LeadPopup product={product} page={page} />}
      <div className="default-margin py-3">
        <Breadcrumbs items={[{ label: categoryLabel, href: categoryHref(cat) }, { label }]} />
      </div>
      <section className="bg-ink text-white">
        <div className="default-margin py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">{category.title}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold uppercase text-white md:text-5xl">
            {c?.headline ?? `${name} for Sale & Rent`}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            {c?.intro ??
              `Buy or rent ${name.toLowerCase()} from Mtandt, with delivery, operator training and service support across India.`}
          </p>
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
            {(c || brochure) && (
              <BrochureButton
                title={`${product} Brochure`}
                href={brochure?.documentUrl ?? null}
                page={page}
                className="inline-flex items-center gap-2 rounded border border-brand px-5 py-2.5 text-sm font-semibold text-brand"
              />
            )}
          </div>
        </div>
      </section>

      {c && (
        <section className="bg-white pt-12 md:pt-16">
          <div className="default-margin grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.points.map((p) => (
              <div key={p.title} className="rounded-md border-t-4 border-brand bg-[#f2f2f2] p-5">
                <h2 className="text-base font-semibold uppercase text-ink">{p.title}</h2>
                <p className="mt-2 text-sm text-ink/80">{p.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(buy?.products.length || rent?.products.length) ? (
        <section className="bg-white py-12 md:py-16">
          <div className="default-margin">
            <Models title={`${label} for Sale`} products={buy?.products ?? []} href={listingHref("buy", cat, sub)} />
            <Models title={`${label} for Rent`} products={rent?.products ?? []} href={listingHref("rental", cat, sub)} />
          </div>
        </section>
      ) : (
        <div className="pb-12 md:pb-16" />
      )}

      {(subcategory.html || subcategory.faqs.length > 0) && (
        <section className="bg-[#f2f2f2] py-12 md:py-16">
          <div className="default-margin grid gap-10 lg:grid-cols-2">
            {subcategory.html && (
              <div>
                <h2 className="mb-4 text-xl font-semibold uppercase text-ink md:text-2xl">About {label}</h2>
                <div className="prose-legacy text-sm" dangerouslySetInnerHTML={{ __html: subcategory.html }} />
              </div>
            )}
            {subcategory.faqs.length > 0 && (
              <div className="overflow-hidden rounded-md bg-white">
                <Faqs items={subcategory.faqs} />
              </div>
            )}
          </div>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="bg-white pt-12">
          <nav aria-label={`Other ${category.title}`} className="default-margin">
            <h2 className="mb-4 text-lg font-semibold uppercase text-ink">Other {category.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={subcategoryHref(cat, s.slug)}
                  className="rounded-md border-l-4 border-brand bg-[#f2f2f2] px-4 py-3 text-sm font-semibold text-ink no-underline hover:bg-brand-cream"
                >
                  {landingConfig(cat, s.slug)?.label ?? s.name}
                </Link>
              ))}
            </div>
          </nav>
        </section>
      )}

      <section id="enquire" className="scroll-mt-24 bg-white py-12 md:py-16">
        <div className="default-margin">
          <div className="rounded-md bg-[#f2f2f2] px-5 py-8 md:px-9 md:py-11">
            <h2 className="text-2xl font-medium uppercase text-ink md:text-[28px]">Enquire about {label}</h2>
            <p className="mt-2 mb-6 text-sm text-ink/80">
              Tell us about your site and our team will recommend the right model to buy or rent.
            </p>
            <LeadForm form="enquiry" fields={fields} hidden={{ product, page }} submitLabel="Request a Quote" />
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { enquiryFields } from "@/content/forms";
import { getListing, listingHref, type CatalogProduct } from "@/content/products";
import { contact } from "@/content/site";
import LeadForm from "@/ui/Forms/LeadForm";
import Faqs from "@/ui/Products/Faqs";
import ProductCard from "@/ui/Products/ProductCard";

/**
 * Campaign landing pages for a single aerial-work-platform subcategory (boom lift,
 * scissor lift): hero with CTAs, selling points, buy + rental models from the catalogue,
 * the category write-up and FAQs, and an enquiry form tagged with the product.
 */

export type LiftLandingConfig = {
  path: string;
  subcategory: string;
  /** Matches an option in `productInterestOptions`. */
  product: string;
  headline: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  points: { title: string; text: string }[];
};

const CATEGORY = "aerial-work-platform";
const MAX_MODELS = 8;

export const liftLandingMetadata = (c: LiftLandingConfig): Metadata => ({
  title: { absolute: c.metaTitle },
  description: c.metaDescription,
  alternates: { canonical: c.path },
});

function Models({ title, products, href }: { title: string; products: CatalogProduct[]; href: string }) {
  if (!products.length) return null;
  return (
    <div className="mt-10 first:mt-0">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-xl font-semibold uppercase text-ink md:text-2xl">{title}</h3>
        <Link href={href} className="text-sm font-semibold text-ink underline">
          View all {products.length} models
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, MAX_MODELS).map((p) => (
          <ProductCard key={p.slug} href={`/product-detail/${p.slug}`} title={p.title} image={p.image} />
        ))}
      </div>
    </div>
  );
}

export default async function LiftLanding({ config: c }: { config: LiftLandingConfig }) {
  const [buy, rent] = await Promise.all([
    getListing("buy", CATEGORY, c.subcategory),
    getListing("rental", CATEGORY, c.subcategory),
  ]);
  const sub = buy?.subcategory ?? rent?.subcategory;
  const fields = enquiryFields.filter((f) => f.name !== "product");

  return (
    <>
      <section className="bg-ink text-white">
        <div className="default-margin py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Aerial Work Platforms</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold uppercase md:text-5xl">{c.headline}</h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">{c.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#enquire" className="btn-yellow no-underline">
              Get a Quote
            </a>
            <a href={contact.phoneHref} className="border border-white px-5 py-2.5 text-sm font-semibold text-white no-underline">
              Call {contact.phone}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="default-margin grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {c.points.map((p) => (
            <div key={p.title} className="border-t-4 border-brand bg-[#f2f2f2] p-5">
              <h2 className="text-base font-semibold uppercase text-ink">{p.title}</h2>
              <p className="mt-2 text-sm text-ink/80">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white pb-12 md:pb-16">
        <div className="default-margin">
          <Models
            title={`${c.product}s for Sale`}
            products={buy?.products ?? []}
            href={listingHref("buy", CATEGORY, c.subcategory)}
          />
          <Models
            title={`${c.product}s for Rent`}
            products={rent?.products ?? []}
            href={listingHref("rental", CATEGORY, c.subcategory)}
          />
        </div>
      </section>

      {sub && (sub.html || sub.faqs.length > 0) && (
        <section className="bg-[#f2f2f2] py-12 md:py-16">
          <div className="default-margin grid gap-10 lg:grid-cols-2">
            {sub.html && (
              <div>
                <h2 className="mb-4 text-xl font-semibold uppercase text-ink md:text-2xl">About {c.product}s</h2>
                <div className="prose-legacy text-sm" dangerouslySetInnerHTML={{ __html: sub.html }} />
              </div>
            )}
            {sub.faqs.length > 0 && (
              <div className="bg-white">
                <Faqs items={sub.faqs} />
              </div>
            )}
          </div>
        </section>
      )}

      <section id="enquire" className="scroll-mt-24 bg-white py-12 md:py-16">
        <div className="default-margin">
          <div className="bg-[#f2f2f2] px-5 py-8 md:px-9 md:py-11">
            <h2 className="text-2xl font-medium uppercase text-ink md:text-[28px]">Enquire about a {c.product}</h2>
            <p className="mt-2 mb-6 text-sm text-ink/80">
              Tell us your site and working height and our team will recommend the right model to buy or rent.
            </p>
            <LeadForm
              form="enquiry"
              fields={fields}
              hidden={{ product: c.product, page: c.path.slice(1) }}
              submitLabel="Request a Quote"
            />
          </div>
        </div>
      </section>
    </>
  );
}

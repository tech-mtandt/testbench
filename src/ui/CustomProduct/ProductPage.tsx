import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import ProductTabs from "@/ui/CustomProduct/ProductTabs";
import EnquireButton from "@/ui/CustomProduct/EnquireButton";
import FilterGallery from "@/ui/CustomProduct/FilterGallery";
import { CenterTitle, ClientLogos, RelatedProducts } from "@/ui/CustomProduct/Sections";
import { customProductPath, getCustomProduct, type Kind } from "@/content/custom";

export type ProductParams = Promise<{ category: string; slug: string }>;

export async function productMetadata(kind: Kind, params: ProductParams): Promise<Metadata> {
  const { category, slug } = await params;
  const p = getCustomProduct(kind, category, slug);
  if (!p) return {};
  return {
    title: p.meta.title ? { absolute: p.meta.title } : p.title,
    description: p.meta.description ?? undefined,
    keywords: p.meta.keywords ?? undefined,
    alternates: { canonical: customProductPath(kind, p, slug) },
    openGraph: { title: p.meta.title ?? p.title, description: p.meta.description ?? undefined, images: p.hero ?? undefined },
  };
}

export default async function ProductPage({ kind, params }: { kind: Kind; params: ProductParams }) {
  const { category, slug } = await params;
  const p = getCustomProduct(kind, category, slug);
  if (!p) notFound();

  return (
    <main>
      <div className="default-margin py-3">
        <Breadcrumbs
          items={[
            { label: kind === "buy" ? "Buy" : "Rent" },
            ...(p.crumb.label ? [{ label: p.crumb.label, href: p.crumb.href ?? undefined }] : []),
            { label: p.title },
          ]}
        />
      </div>

      {p.hero && (
        <div className="h-52 w-full overflow-hidden bg-surface sm:h-72 lg:h-[400px]">
          <Img src={p.hero} alt={p.title} loading="eager" className="h-full w-full object-cover" />
        </div>
      )}

      <section className="py-10 md:py-14">
        <div className="default-margin grid gap-10 md:grid-cols-2 md:gap-8">
          <div className="min-w-0">
            <h1 className="mb-8 text-xl font-semibold text-ink">{p.title}</h1>
            <div
              className="prose-legacy text-[15px] md:text-justify leading-relaxed [&_b]:text-ink [&_strong]:text-ink"
              dangerouslySetInnerHTML={{ __html: p.intro }}
            />
          </div>
          <div className="min-w-0 md:pl-4">
            <ProductTabs specs={p.specs} features={p.features} benefits={p.benefits} download={p.download} />
          </div>
        </div>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <div className="default-margin">
          {p.journey.length > 0 && (
            <>
              <CenterTitle>Customer Journey</CenterTitle>
              <ol className="mx-auto mb-10 grid max-w-[1100px] gap-6 md:grid-cols-2 md:gap-8">
                {p.journey.map((step, i) => (
                  <li key={step.title} className="relative min-h-40 bg-white py-8 pl-20 pr-6 shadow-[0_0_12px_rgba(0,0,0,0.06)] md:pl-24">
                    <span className="absolute left-0 top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-r-full bg-brand text-3xl text-ink md:h-[70px] md:w-[70px] md:text-4xl">
                      {i + 1}
                    </span>
                    <h3 className="mb-2 text-base font-semibold uppercase text-ink">{step.title}</h3>
                    <div
                      className="prose-legacy text-sm text-ink [&_p]:mb-2 [&_ul]:mb-0 [&_ul]:text-xs"
                      dangerouslySetInnerHTML={{ __html: step.html }}
                    />
                  </li>
                ))}
              </ol>
            </>
          )}
          <div className={`text-center ${p.journey.length ? "" : "md:py-10"}`}>
            <EnquireButton product={p.title} productId={p.productId} kind={kind} />
          </div>
        </div>
      </section>

      {p.gallery && (
        <section className="py-12">
          <div className="default-margin">
            <CenterTitle>Application &amp; Industries</CenterTitle>
            <FilterGallery filters={p.gallery.filters} items={p.gallery.items} />
          </div>
        </section>
      )}

      <RelatedProducts items={p.related} />
      <ClientLogos logos={p.clients} />
    </main>
  );
}

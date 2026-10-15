import type { Metadata } from "next";
import { productHref, relatedProducts, type Product } from "@/content/products";
import Carousel from "@/ui/Carousel";
import { Breadcrumbs, type Crumb } from "@/ui/PageChrome";
import DetailTabs from "@/ui/Products/DetailTabs";
import EnquireButton from "@/ui/Products/EnquireButton";
import ProductCard from "@/ui/Products/ProductCard";
import ProductGallery from "@/ui/Products/ProductGallery";

/** Product page metadata; the canonical is the product's own address (productHref). */
export function productMetadata(p: Product): Metadata {
  const image = p.meta.image || p.image;
  return {
    title: { absolute: p.meta.title || p.title },
    description: p.meta.description,
    keywords: p.meta.keywords,
    alternates: { canonical: productHref(p) },
    openGraph: image ? { images: [image] } : undefined,
  };
}

/** Product page body: gallery, description, enquiry, detail tabs and related products. */
export default async function ProductDetail({ p, crumbs }: { p: Product; crumbs: Crumb[] }) {
  const related = await relatedProducts(p);

  return (
    <div className="default-margin pb-12">
      <div className="py-3">
        <Breadcrumbs items={crumbs} />
      </div>

      <div className="grid gap-8 pt-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10">
        <div className="min-w-0 md:pl-4">
          <ProductGallery main={p.image} images={p.gallery} alt={p.title} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold uppercase leading-snug text-ink md:text-2xl" style={{ fontFamily: "Arial, sans-serif" }}>
            {p.title}
          </h1>
          {p.model && <p className="mt-1 text-sm text-ink">Model No : {p.model}</p>}
          {p.descriptionHtml && (
            <div
              className="mt-5 text-[15px] md:text-justify leading-relaxed text-ink [&_b]:font-semibold [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: p.descriptionHtml }}
            />
          )}
          <div className="mt-6">
            <EnquireButton product={p.title} slug={p.slug} mode={p.mode} />
          </div>
        </div>
      </div>

      <DetailTabs
        p={{
          specs: p.specs,
          featuresHtml: p.featuresHtml,
          optionsHtml: p.optionsHtml,
          applications: p.applications,
          download: p.download,
          charts: p.charts,
          model: p.model,
        }}
      />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-bold text-ink" style={{ fontFamily: "Arial, sans-serif" }}>
            Related Products
          </h2>
          <Carousel>
            {related.map((r) => (
              <ProductCard
                key={r.slug}
                href={productHref(r)}
                title={r.title}
                image={r.image}
                className="w-[70%] shrink-0 snap-start sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
              />
            ))}
          </Carousel>
        </section>
      )}
    </div>
  );
}

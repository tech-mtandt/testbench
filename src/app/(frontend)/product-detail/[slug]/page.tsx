import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { allProducts, getCategory, getProduct, listingHref, relatedProducts } from "@/content/products";
import { Breadcrumbs, type Crumb } from "@/ui/PageChrome";
import Carousel from "@/ui/Carousel";
import ProductGallery from "@/ui/Products/ProductGallery";
import DetailTabs from "@/ui/Products/DetailTabs";
import EnquireButton from "@/ui/Products/EnquireButton";
import ProductCard from "@/ui/Products/ProductCard";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: { absolute: p.meta.title || p.title },
    description: p.meta.description,
    keywords: p.meta.keywords,
    alternates: { canonical: `/product-detail/${p.slug}` },
    openGraph: p.image ? { images: [p.image] } : undefined,
  };
}

export default async function Page({ params }: Params) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const mode = p.mode === "rent" ? "rental" : "buy";
  const cat = p.category ? getCategory(p.category) : null;
  const crumbs: Crumb[] = [{ label: p.mode === "rent" ? "Rent" : "Buy" }];
  if (cat) crumbs.push({ label: cat.crumb || cat.title, href: `/category-by-subcategory/${cat.slug}` });
  if (p.category && p.subcategory)
    crumbs.push({ label: p.subcategoryName || p.subcategory, href: listingHref(mode, p.category, p.subcategory) });
  crumbs.push({ label: p.title });
  const related = relatedProducts(p);

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
                href={`/product-detail/${r.slug}`}
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

import configPromise from "@payload-config";
import { getPayload } from "payload";
import { notFound } from "next/navigation";
import Breadcrumb, { type BreadcrumbItem } from "@/ui/Breadcrumb";
import ProductGallery, { type GalleryImage } from "@/ui/Products/ProductGalleryCms";
import ProductTabs from "@/ui/Products/ProductTabs";
import ProductEnquiryModal from "@/ui/Products/ProductEnquiryModal";
import RelatedProductsSlider, {
  type RelatedProduct,
} from "@/ui/Products/RelatedProductsSlider";
import { RichText } from "@/components/RichText";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: "products",
    depth: 2,
    limit: 1,
    where: { slug: { equals: slug } },
  });

  const product = docs[0];
  if (!product) notFound();

  const featuredImage =
    product.featuredImage && typeof product.featuredImage === "object"
      ? product.featuredImage
      : null;

  const galleryImages: GalleryImage[] = [
    ...(featuredImage?.url
      ? [{ url: featuredImage.url, alt: featuredImage.alt || product.title }]
      : []),
    ...(product.gallery ?? [])
      .map((item) => (item.image && typeof item.image === "object" ? item.image : null))
      .filter((image): image is NonNullable<typeof image> => Boolean(image?.url))
      .map((image) => ({ url: image.url as string, alt: image.alt || product.title })),
  ];

  const specifications = [
    product.modelNo ? { label: "Model No", value: product.modelNo } : null,
    product.workingHeight != null
      ? { label: "Working Height", value: String(product.workingHeight) }
      : null,
    product.powerType ? { label: "Power Type", value: product.powerType } : null,
    product.maxLiftingCapacity != null
      ? { label: "Max Lifting Capacity", value: String(product.maxLiftingCapacity) }
      : null,
    ...(product.specifications ?? []).map((row) => ({ label: row.label, value: row.value })),
  ].filter((row): row is { label: string; value: string } => Boolean(row));

  const standardFeatures = (product.standardFeatures ?? []).map((item) => item.feature);
  const options = (product.options ?? []).map((item) => item.option);
  const applications = (product.applications ?? []).map((item) => item.application);

  const downloads = (product.downloads ?? [])
    .map((item) => {
      const file = item.file && typeof item.file === "object" ? item.file : null;
      return file?.url ? { label: item.label, url: file.url } : null;
    })
    .filter((item): item is { label: string; url: string } => Boolean(item));

  const chartImage =
    product.chartImage && typeof product.chartImage === "object" ? product.chartImage : null;

  let relatedProducts: RelatedProduct[] = [];

  if (product.category || product.subcategory) {
    const orClauses = [];
    if (product.subcategory) orClauses.push({ subcategory: { equals: product.subcategory } });
    if (product.category) orClauses.push({ category: { equals: product.category } });

    const { docs: relatedDocs } = await payload.find({
      collection: "products",
      depth: 1,
      limit: 12,
      where: {
        and: [{ id: { not_equals: product.id } }, { or: orClauses }],
      },
    });

    relatedProducts = relatedDocs.map((doc) => {
      const image =
        doc.featuredImage && typeof doc.featuredImage === "object" ? doc.featuredImage : null;
      return {
        id: doc.id,
        title: doc.title,
        slug: doc.slug,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt || doc.title,
      };
    });
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    ...(product.category
      ? [
          {
            label: product.category,
            href: `/products?category=${encodeURIComponent(product.category)}`,
          },
        ]
      : []),
    ...(product.subcategory
      ? [
          {
            label: product.subcategory,
            href: `/products?subcategory=${encodeURIComponent(product.subcategory)}`,
          },
        ]
      : []),
    { label: product.title },
  ];

  return (
    <div className="default-margin flex flex-col gap-12 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ProductGallery images={galleryImages} />

        <div className="flex flex-col gap-4">
          <h1>{product.title}</h1>
          {product.modelNo && <p className="font-semibold">Model No : {product.modelNo}</p>}
          {product.content && <RichText data={product.content} />}
          <div>
            <ProductEnquiryModal
              productTitle={product.title}
              triggerClassName="inline-block bg-primary-yellow px-8 py-3 text-sm font-bold uppercase"
            />
          </div>
        </div>
      </div>

      <ProductTabs
        specifications={specifications}
        standardFeatures={standardFeatures}
        options={options}
        applications={applications}
        downloads={downloads}
        chartImageUrl={chartImage?.url ?? null}
        chartImageAlt={chartImage?.alt || product.title}
      />

      <RelatedProductsSlider products={relatedProducts} />
    </div>
  );
}

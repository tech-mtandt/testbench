import configPromise from "@payload-config";
import { getPayload } from "payload";
import Breadcrumb from "@/ui/Breadcrumb";
import ProductsGrid, { type ProductItem } from "@/ui/Products/ProductsGrid";

export default async function Page() {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "products",
    depth: 1,
    limit: 0,
    sort: "title",
  });

  const products: ProductItem[] = docs.map((doc) => {
    const image =
      doc.featuredImage && typeof doc.featuredImage === "object" ? doc.featuredImage : null;

    return {
      id: doc.id,
      title: doc.title,
      slug: doc.slug,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? doc.title,
      condition: doc.condition ?? null,
      inStock: doc.inStock ?? true,
      country: doc.country ?? null,
      category: doc.category ?? null,
      subcategory: doc.subcategory ?? null,
      primaryType: doc.primaryType ?? null,
      powerType: doc.powerType ?? null,
      modelNo: doc.modelNo ?? null,
      workingHeight: doc.workingHeight ?? null,
      maxLiftingCapacity: doc.maxLiftingCapacity ?? null,
    };
  });

  return (
    <div className="min-h-[80vh]">
      <div className="default-margin py-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products" },
          ]}
        />
      </div>

      <ProductsGrid products={products} />
    </div>
  );
}

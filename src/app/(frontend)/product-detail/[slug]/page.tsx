import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { getProductOrRenamed, productLink, resolveProduct } from "@/content/products";
import ProductDetail, { productMetadata } from "@/ui/Products/ProductDetail";

type Params = { params: Promise<{ slug: string }> };

const placed = (p: { category: string | null; subcategory: string | null }) => Boolean(p.category && p.subcategory);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProductOrRenamed((await params).slug);
  return p && !placed(p) ? productMetadata(p) : {};
}

/**
 * Old product address. Products with a category and subcategory redirect to
 * /<category>/<subcategory>/<product>; the few the catalogue can't place (no category or
 * subcategory in the CMS) are still shown here, as before, rather than 404ing.
 */
export default async function Page({ params }: Params) {
  const { slug } = await params;
  const found = await resolveProduct(slug);
  const p = found?.p;
  if (p && (placed(p) || p.slug !== slug)) permanentRedirect(productLink(p, found.rent));
  if (!p) {
    redirectLegacy(`/product-detail/${slug}`);
    notFound();
  }
  return <ProductDetail p={p} crumbs={[{ label: "Products", href: "/products" }, { label: p.title }]} />;
}

import { notFound, permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { productLink, resolveProduct } from "@/content/products";

/**
 * Leftover address from an earlier build: one product page per product lives at
 * /<category>/<subcategory>/<product> (see content/urls), so this redirects there.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await resolveProduct(slug);
  if (found) permanentRedirect(productLink(found.p, found.rent));
  redirectLegacy(`/product-detail/${slug}`);
  notFound();
}

import { notFound, permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { getProductOrRenamed, productHref } from "@/content/products";

/**
 * Leftover address from an earlier build: one product page per product lives at
 * /<category>/<subcategory>/<product> (see content/urls), so this redirects there.
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductOrRenamed(slug);
  if (p) permanentRedirect(productHref(p));
  redirectLegacy(`/product-detail/${slug}`);
  notFound();
}

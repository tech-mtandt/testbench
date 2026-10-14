import { notFound, permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { getProduct, productHref } from "@/content/products";

/** Old product address -> /<category>/<subcategory>/<product>. */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (p?.category && p.subcategory) permanentRedirect(productHref(p));
  redirectLegacy(`/product-detail/${slug}`);
  notFound();
}

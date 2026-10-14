import { permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { listingHref } from "@/content/urls";

/** Old listing address -> /<category>/<subcategory>/buy. */
export default async function Page({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params;
  redirectLegacy(`/product-category-buy/${category}/${subcategory}`);
  permanentRedirect(listingHref("buy", category, subcategory));
}

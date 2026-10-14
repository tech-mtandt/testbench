import { permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { listingHref } from "@/content/urls";

/** Old listing address -> /<category>/<subcategory>/rent. */
export default async function Page({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params;
  redirectLegacy(`/product-category-rentel/${category}/${subcategory}`);
  permanentRedirect(listingHref("rental", category, subcategory));
}

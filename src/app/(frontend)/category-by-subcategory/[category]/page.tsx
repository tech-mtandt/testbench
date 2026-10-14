import { permanentRedirect } from "next/navigation";
import { redirectLegacy } from "@/content/legacy-redirects";
import { categoryAlias } from "@/content/products";
import { categoryHref } from "@/content/urls";

/** Old category address -> /<category>. */
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  redirectLegacy(`/category-by-subcategory/${category}`);
  permanentRedirect(categoryHref((await categoryAlias(category)) ?? category));
}

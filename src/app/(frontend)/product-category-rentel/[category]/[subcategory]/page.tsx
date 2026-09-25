import { permanentRedirect } from "next/navigation";

/** The live site's "Choose > Rental" modal links to this misspelt path and redirects it. */
export default async function Page({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category, subcategory } = await params;
  permanentRedirect(`/product-category-rental/${category}/${subcategory}`);
}

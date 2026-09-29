import { notFound, permanentRedirect } from "next/navigation";
import { categoryAlias } from "@/content/products";

/** Legacy camelCase URLs (still linked from the old footer) -> kebab-case landing pages. */
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const target = categoryAlias((await params).category);
  if (!target) notFound();
  permanentRedirect(`/category-by-subcategory/${target}`);
}

import { notFound, permanentRedirect } from "next/navigation";
import { categoryAlias } from "@/content/products";
import { categoryHref } from "@/content/urls";

/** Legacy camelCase URLs (still linked from the old footer) -> kebab-case category pages. */
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const target = await categoryAlias((await params).category);
  if (!target) notFound();
  permanentRedirect(categoryHref(target));
}

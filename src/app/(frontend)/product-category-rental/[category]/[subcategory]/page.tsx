import { notFound, permanentRedirect } from "next/navigation";
import { resolveLegacyPath } from "@/content/catalog-view";

/** Legacy URL — permanently redirects into the unified catalog (/products/…). */
export default async function Page({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const p = await params;
  const to = resolveLegacyPath(`/product-category-rental/${p.category}/${p.subcategory}`);
  if (!to) notFound();
  permanentRedirect(to);
}

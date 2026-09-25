import { notFound, permanentRedirect } from "next/navigation";
import { resolveLegacyPath } from "@/content/catalog-view";

/** Legacy URL — permanently redirects into the unified catalog (/products/…). */
export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const p = await params;
  const to = resolveLegacyPath(`/category-by-subcategory/${p.category}`);
  if (!to) notFound();
  permanentRedirect(to);
}

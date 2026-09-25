import { notFound, permanentRedirect } from "next/navigation";
import { resolveLegacyPath } from "@/content/catalog-view";

/** Legacy URL — permanently redirects into the unified catalog (/products/…). */
export default async function Page({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const p = await params;
  const to = resolveLegacyPath(`/custom-product-detail-buy/${p.category}/${p.slug}`);
  if (!to) notFound();
  permanentRedirect(to);
}

import { notFound, permanentRedirect } from "next/navigation";
import { listingParams, resolveSegments, subcategoryHref } from "@/content/products";
import SubcategoryHub, { hubMetadata, type HubParams } from "@/ui/Landing/SubcategoryHub";

export function generateStaticParams() {
  return listingParams();
}

export const generateMetadata = hubMetadata;

export default async function Page({ params }: HubParams) {
  const p = await params;
  const { category, subcategory, canonical } = resolveSegments(p.category, p.subcategory);
  if (!canonical) permanentRedirect(subcategoryHref(category, subcategory));
  const hub = await SubcategoryHub({ category, subcategory });
  if (!hub) notFound();
  return hub;
}

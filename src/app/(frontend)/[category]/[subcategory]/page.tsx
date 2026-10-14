import { notFound } from "next/navigation";
import { listingParams } from "@/content/products";
import SubcategoryHub, { hubMetadata, type HubParams } from "@/ui/Landing/SubcategoryHub";

export function generateStaticParams() {
  return listingParams();
}

export const generateMetadata = hubMetadata;

export default async function Page({ params }: HubParams) {
  const { category, subcategory } = await params;
  const hub = await SubcategoryHub({ category, subcategory });
  if (!hub) notFound();
  return hub;
}

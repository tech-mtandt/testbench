import { productHref, type CatalogProduct, type Listing } from "@/content/products";
import type { ModelCard, ModelSet } from "./ModelShowcase";

const MAX_CARDS = 8;

// Heights in the catalogue are metres, mostly without the unit ("24", "12.8 m").
const withUnit = (label: string, value: string) => (/height/i.test(label) && /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()} m` : value);

export function modelCard(p: CatalogProduct): ModelCard {
  const specs = p.row
    .filter(([k, v]) => k !== "Model No" && v)
    .slice(0, 2)
    .map(([k, v]) => [k, withUnit(k, v)] as [string, string]);
  return { href: productHref(p), title: p.title, image: p.image, model: p.model, specs };
}

export function modelSet(listing: Listing | null, href: string): ModelSet | null {
  if (!listing?.products.length) return null;
  return { cards: listing.products.slice(0, MAX_CARDS).map(modelCard), total: listing.products.length, href };
}

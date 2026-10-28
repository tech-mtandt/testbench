import { heightOf, productLink, type CatalogProduct, type Listing } from "@/content/products";
import type { ModelCard } from "./ModelShowcase";

// Heights in the catalogue are metres, mostly without the unit ("24", "12.8 m").
const withUnit = (label: string, value: string) => (/height/i.test(label) && /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()} m` : value);

export function modelCard(p: CatalogProduct): ModelCard {
  const specs = p.row
    .filter(([k, v]) => k !== "Model No" && v)
    .slice(0, 2)
    .map(([k, v]) => [k, withUnit(k, v)] as [string, string]);
  return {
    href: productLink(p, false),
    rentHref: productLink(p, true),
    title: p.title,
    image: p.image,
    model: p.model,
    specs,
    buy: p.buy,
    rent: p.rent,
    height: heightOf(p),
  };
}

/** A range's machines (each once, whether for sale, hire or both), lowest first. */
export function rangeModels(buy: Listing | null, rent: Listing | null): ModelCard[] {
  const all = new Map([...(buy?.products ?? []), ...(rent?.products ?? [])].map((p) => [p.slug, p]));
  return [...all.values()].sort((a, b) => (heightOf(a) ?? Infinity) - (heightOf(b) ?? Infinity)).map(modelCard);
}

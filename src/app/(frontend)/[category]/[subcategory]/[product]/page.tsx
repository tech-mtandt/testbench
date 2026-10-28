import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { landingConfig } from "@/content/landing";
import {
  allProducts,
  categoryHref,
  getCategory,
  getProduct,
  listingHref,
  productHref,
  productLink,
  productPath,
  resolveProduct,
  resolveSegments,
  subcategoryHref,
} from "@/content/products";
import type { Crumb } from "@/ui/PageChrome";
import ProductDetail, { productMetadata } from "@/ui/Products/ProductDetail";

type Params = { params: Promise<{ category: string; subcategory: string; product: string }> };

export async function generateStaticParams() {
  return (await allProducts())
    // Products that moved to a group brand website only redirect (next.config.mjs).
    .filter((p) => p.category && p.subcategory && productHref(p) === productPath(p))
    .map((p) => {
      const [, category, subcategory] = productPath(p).split("/");
      return { category, subcategory, product: p.slug };
    });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProduct((await params).product);
  return p ? productMetadata(p) : {};
}

export default async function Page({ params }: Params) {
  const { category: catSeg, subcategory: subSeg, product } = await params;
  const { category, subcategory, canonical } = resolveSegments(catSeg, subSeg);
  const found = await resolveProduct(product);
  if (!found) notFound();
  const { p, rent } = found;
  // One address per product: a wrong category/subcategory in the path, a renamed product or an
  // old address (such as its former separate rent page) goes to the right one.
  if (!canonical || p.slug !== product || p.category !== category || p.subcategory !== subcategory) {
    permanentRedirect(productLink(p, rent));
  }
  const cat = await getCategory(category);
  const range = cat?.subcategories.find((s) => s.slug === subcategory);
  const rangeLabel = landingConfig(category, subcategory)?.label ?? range?.name ?? p.subcategoryName ?? subcategory;
  // A machine that is only for sale (or only for hire) sits under that listing; one that is
  // both has a Buy | Rent switch on the page instead.
  const only = p.buy && !p.rent ? "buy" : p.rent && !p.buy ? "rental" : null;
  const crumbs: Crumb[] = [
    { label: cat?.crumb || cat?.title || p.categoryName || category, href: categoryHref(category) },
    { label: rangeLabel, href: subcategoryHref(category, subcategory) },
    ...(only ? [{ label: only === "buy" ? "Buy" : "Rent", href: listingHref(only, category, subcategory) }] : []),
    { label: p.title },
  ];
  return <ProductDetail p={p} crumbs={crumbs} />;
}

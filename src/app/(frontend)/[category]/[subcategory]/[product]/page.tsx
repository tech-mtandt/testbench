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
  resolveSegments,
  subcategoryHref,
} from "@/content/products";
import type { Crumb } from "@/ui/PageChrome";
import ProductDetail, { productMetadata } from "@/ui/Products/ProductDetail";

type Params = { params: Promise<{ category: string; subcategory: string; product: string }> };

export async function generateStaticParams() {
  return (await allProducts())
    .filter((p) => p.category && p.subcategory)
    .map((p) => {
      const [, category, subcategory] = productHref(p).split("/");
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
  const p = await getProduct(product);
  if (!p) notFound();
  // One address per product: a wrong category/subcategory in the path goes to the right one.
  if (!canonical || p.category !== category || p.subcategory !== subcategory) permanentRedirect(productHref(p));
  const mode = p.mode === "rent" ? "rental" : "buy";
  const cat = await getCategory(category);
  const range = cat?.subcategories.find((s) => s.slug === subcategory);
  const rangeLabel = landingConfig(category, subcategory)?.label ?? range?.name ?? p.subcategoryName ?? subcategory;
  const crumbs: Crumb[] = [
    { label: cat?.crumb || cat?.title || p.categoryName || category, href: categoryHref(category) },
    { label: rangeLabel, href: subcategoryHref(category, subcategory) },
    { label: mode === "buy" ? "Buy" : "Rent", href: listingHref(mode, category, subcategory) },
    { label: p.title },
  ];
  return <ProductDetail p={p} crumbs={crumbs} />;
}

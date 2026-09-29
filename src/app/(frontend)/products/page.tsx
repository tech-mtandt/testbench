import type { Metadata } from "next";
import Link from "next/link";
import { allProducts, categories } from "@/content/products";
import { PageBanner } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import home from "@/content/scraped/home.json";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Aerial work platforms, material handling equipment, aluminium scaffolding, mobile light towers, road mats, fall protection and tools for sale and rent from Mtandt Group.",
};

/** Hub of product categories (the live site has no /products page). */
export default function Page() {
  const products = allProducts();
  const fold = (t: string) => t.toLowerCase().replace(/[^a-z]/g, "");
  const homeItems = home.productTabs.flatMap((t) => t.items);
  const imageFor = (cat: string) =>
    products.find((p) => p.category === cat && p.image)?.image ??
    homeItems.find((i) => categories.find((c) => c.slug === cat)?.subcategories.some((s) => fold(s.name) === fold(i.title)))
      ?.image ??
    null;

  return (
    <>
      <PageBanner title="Products" crumbs={[{ label: "Products" }]} />
      <div className="default-margin py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => {
            const count = products.filter((p) => p.category === c.slug).length;
            return (
              <Link
                key={c.slug}
                href={`/category-by-subcategory/${c.slug}`}
                className="group flex flex-col bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] no-underline"
              >
                <div className="flex h-48 items-center justify-center bg-surface p-4">
                  {imageFor(c.slug) ? (
                    <Img src={imageFor(c.slug)!} alt={c.title} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-4xl font-bold text-brand">{c.title.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col border-t-4 border-brand p-4">
                  <h2 className="text-base font-semibold text-ink group-hover:underline">{c.title}</h2>
                  <p className="mt-2 line-clamp-3 text-xs text-ink-soft">{c.intro}</p>
                  <p className="mt-auto pt-3 text-xs text-ink-soft">
                    {c.subcategories.map((s) => s.name).join(" · ")}
                    {count > 0 && <span className="block pt-1 font-medium text-ink">{count} models</span>}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

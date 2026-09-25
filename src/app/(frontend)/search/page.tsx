import type { Metadata } from "next";
import Link from "next/link";
import { searchProducts, summarize } from "@/content/products";
import { Breadcrumbs } from "@/ui/PageChrome";
import SearchBar from "@/ui/Home/SearchBar";
import ProductRow from "@/ui/Products/ProductRow";
import CompareBar from "@/ui/Products/CompareBar";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = [(await searchParams).q].flat()[0]?.trim();
  return { title: q ? `Search results for “${q}”` : "Search", robots: { index: false } };
}

export default async function Page({ searchParams }: Props) {
  const q = [(await searchParams).q].flat()[0]?.trim() ?? "";
  const { products, subcategories } = searchProducts(q);

  return (
    <div className="default-margin pb-16">
      <div className="py-3">
        <Breadcrumbs items={[{ label: "Search" }]} />
      </div>
      <div className="flex justify-center py-6">
        <SearchBar defaultValue={q} floating={false} />
      </div>

      {q ? (
        <>
          <h1 className="mb-2 text-xl font-semibold text-ink">Search results for “{q}”</h1>
          <p className="mb-6 text-sm text-ink">
            Showing <strong>{products.length}</strong> Result{products.length === 1 ? "" : "s"}
          </p>

          {subcategories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {subcategories.map((s) => (
                <Link
                  key={`${s.category.slug}/${s.subcategory.slug}`}
                  href={s.href}
                  className="border border-brand bg-brand-cream px-3 py-1.5 text-sm text-ink no-underline hover:bg-brand"
                >
                  {s.subcategory.name} <span className="text-ink-soft">· {s.category.crumb || s.category.title}</span>
                </Link>
              ))}
            </div>
          )}

          {products.length ? (
            <div className="space-y-5">
              {products.map((p) => (
                <ProductRow key={p.slug} p={summarize(p)} />
              ))}
            </div>
          ) : (
            <p className="bg-surface p-8 text-center text-sm text-ink-soft">
              No products matched your search. Try a shorter term such as “scissor lift” or browse{" "}
              <Link href="/products" className="text-ink underline">
                all products
              </Link>
              .
            </p>
          )}
        </>
      ) : (
        <p className="py-8 text-center text-sm text-ink-soft">Type a product name, model number or category to search.</p>
      )}
      <CompareBar />
    </div>
  );
}

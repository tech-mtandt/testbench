import type { Metadata } from "next";
import Link from "next/link";
import { resolveProduct, type Product } from "@/content/products";
import { productHref } from "@/content/urls";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import CompareSync, { RemoveFromCompare } from "@/ui/Products/CompareSync";

export const metadata: Metadata = { title: "Compare", robots: { index: false } };

type Props = { searchParams: Promise<{ p?: string | string[] }> };

const key = (label: string) => label.toLowerCase().replace(/\(.*?\)/g, "").replace(/[^a-z]/g, "");

export default async function Page({ searchParams }: Props) {
  const raw = [(await searchParams).p].flat()[0] ?? "";
  // At most 4 distinct products: never fetch more than that, whatever the query string says.
  const slugs = [...new Set(raw.split(",").map((s) => s.trim()).filter(Boolean))].slice(0, 4);
  // Old addresses (a machine's former rent page) in a saved compare list find their machine.
  const products = [
    ...new Map(
      (await Promise.all(slugs.map((s) => resolveProduct(s))))
        .map((r) => r?.p)
        .filter((p): p is Product => !!p)
        .map((p) => [p.slug, p]),
    ).values(),
  ].slice(0, 4);

  const rows: { label: string; values: string[] }[] = [];
  const index = new Map<string, number>();
  products.forEach((p, col) => {
    for (const [label, value] of p.specs) {
      const k = key(label);
      if (!index.has(k)) {
        index.set(k, rows.length);
        rows.push({ label, values: products.map(() => "") });
      }
      rows[index.get(k)!].values[col] = value;
    }
  });

  return (
    <div className="default-margin pb-16">
      <CompareSync hasSelection={products.length > 0} />
      <div className="py-3">
        <Breadcrumbs items={[{ label: "Compare" }]} />
      </div>
      <h1 className="pt-4 pb-6 text-2xl font-bold uppercase text-ink">Compare</h1>

      {products.length === 0 ? (
        <p className="rounded-md bg-surface p-8 text-center text-sm text-ink-soft">
          No products selected. Tick “Add to compare” on a{" "}
          <Link href="/products" className="text-ink underline">
            product listing
          </Link>{" "}
          to compare up to four models side by side.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <td className="w-48 border border-neutral-200 bg-surface p-3 align-bottom font-semibold">Product images</td>
                {products.map((p) => (
                  <td key={p.slug} className="border border-neutral-200 p-3 align-top">
                    <div className="flex h-36 items-center justify-center">
                      <Img src={p.image ?? undefined} alt={p.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <Link href={productHref(p)} className="mt-2 block text-xs font-semibold uppercase text-ink no-underline hover:underline">
                      {p.title}
                    </Link>
                    <RemoveFromCompare slug={p.slug} />
                  </td>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.label} className={i % 2 ? "" : "bg-surface"}>
                  <th scope="row" className="border border-neutral-200 p-3 text-left font-semibold text-ink">
                    {r.label}
                  </th>
                  {r.values.map((v, j) => (
                    <td key={j} className="border border-neutral-200 p-3 text-ink-soft">
                      {v || "–"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

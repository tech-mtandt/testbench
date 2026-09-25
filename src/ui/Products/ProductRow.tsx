"use client";

import Link from "next/link";
import Img from "@/ui/Img";
import type { ProductSummary } from "@/content/products";
import { useCompare } from "./useCompare";

export default function ProductRow({ p }: { p: ProductSummary }) {
  const { list, toggle } = useCompare();
  const href = `/product-detail/${p.slug}`;
  const id = `cmp-${p.slug}`;
  return (
    <article className="grid gap-5 bg-surface p-4 sm:grid-cols-[155px_minmax(0,1fr)] md:p-5 lg:grid-cols-[155px_minmax(0,1fr)_170px] lg:items-center">
      <Link href={href} className="flex h-44 items-center justify-center border border-neutral-300 bg-white p-2">
        <Img src={p.image ?? undefined} alt={p.title} className="max-h-full max-w-full object-contain" />
      </Link>
      <div className="min-w-0">
        <h3 className="mb-3 truncate text-[13px] font-bold uppercase tracking-wide text-ink" title={p.title}>
          <Link href={href} className="text-ink no-underline hover:underline">
            {p.title}
          </Link>
        </h3>
        {p.row.length > 0 && (
          <table className="w-full max-w-sm text-sm">
            <tbody>
              {p.row.map(([k, v]) => (
                <tr key={k} className="border-b border-neutral-200">
                  <td className="w-1/2 px-2 py-2.5 text-ink-soft">{k}</td>
                  <td className="px-2 py-2.5 text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-1 lg:flex-col lg:items-start">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-1.5 text-sm text-ink">
          <input id={id} type="checkbox" checked={list.includes(p.slug)} onChange={() => toggle(p.slug)} />
          Add to compare
        </label>
        <Link href={href} className="btn-yellow px-4 text-xs no-underline">
          View Details
        </Link>
      </div>
    </article>
  );
}

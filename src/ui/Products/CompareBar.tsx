"use client";

import Link from "next/link";
import { useCompare } from "./useCompare";

/** Sticky bar shown while products are selected for comparison. */
export default function CompareBar() {
  const { list, clear } = useCompare();
  if (!list.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-brand bg-ink text-white">
      <div className="default-margin flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
        <span>
          {list.length} product{list.length > 1 ? "s" : ""} selected for comparison
        </span>
        <div className="flex gap-3">
          <button type="button" onClick={clear} className="text-white/80 underline hover:text-brand">
            Clear
          </button>
          <Link href={`/compare?p=${list.join(",")}`} className="btn-yellow no-underline">
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}

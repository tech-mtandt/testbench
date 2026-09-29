"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompare } from "./useCompare";

/** /compare without ?p= picks up the selection stored in this browser. */
export default function CompareSync({ hasSelection }: { hasSelection: boolean }) {
  const { list } = useCompare();
  const router = useRouter();
  useEffect(() => {
    if (!hasSelection && list.length) router.replace(`/compare?p=${list.join(",")}`);
  }, [hasSelection, list, router]);
  return null;
}

export function RemoveFromCompare({ slug }: { slug: string }) {
  const { list, toggle } = useCompare();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (list.includes(slug)) toggle(slug);
        const rest = new URLSearchParams(window.location.search).get("p")?.split(",").filter((s) => s !== slug) ?? [];
        router.replace(rest.length ? `/compare?p=${rest.join(",")}` : "/compare");
      }}
      className="mt-2 text-xs text-ink-soft underline hover:text-ink"
    >
      Remove
    </button>
  );
}

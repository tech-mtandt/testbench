"use client";

import { Check, GitCompareArrows, Plus } from "lucide-react";
import { buttonClass } from "@/ui/kit/Button";
import { COMPARE_MAX, useCompare, type CompareEntry } from "./compare-store";

/** Add/remove an item from the compare selection. `variant="icon"` sits on a card image. */
export default function CompareToggle({ item, variant = "icon" }: { item: CompareEntry; variant?: "icon" | "button" }) {
  const { has, full, toggle } = useCompare();
  const on = has(item.slug);
  const blocked = full && !on;
  const label = on ? "Remove from compare" : blocked ? `Compare holds up to ${COMPARE_MAX} items` : "Add to compare";

  if (variant === "button")
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        disabled={blocked}
        aria-pressed={on}
        title={label}
        className={buttonClass(on ? "dark" : "outline", "lg")}
      >
        {on ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
        {on ? "In compare" : "Add to compare"}
      </button>
    );

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      disabled={blocked}
      aria-pressed={on}
      aria-label={`${label}: ${item.title}`}
      title={label}
      className={`relative z-10 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
        on ? "bg-ink text-white" : "glass text-ink hover:bg-white"
      }`}
    >
      {on ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      <span>Compare</span>
    </button>
  );
}

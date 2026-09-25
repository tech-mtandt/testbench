"use client";

import { motion } from "motion/react";
import { useId } from "react";

export type SegmentOption<T extends string> = { value: T; label: React.ReactNode };

/** Pill segmented control with a sliding thumb (e.g. Buy / Rent). */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  dark,
  className = "",
  ariaLabel,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  dark?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const id = useId();
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex rounded-full p-1 ${dark ? "bg-white/10" : "bg-ink/5"} ${className}`}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`relative rounded-full font-medium transition-colors ${size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-10 px-5 text-sm"} ${
              active ? "text-ink" : dark ? "text-white/70 hover:text-white" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className={`absolute inset-0 rounded-full shadow-sm ${dark ? "bg-brand" : "bg-white"}`}
                transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

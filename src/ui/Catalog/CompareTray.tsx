"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import Img from "@/ui/Img";
import { COMPARE_MAX, compareHref, useCompare } from "./compare-store";

/** Floating compare selection: thumbnails + "Compare (n)". Hidden on the compare page itself. */
export default function CompareTray() {
  const { list, remove, clear } = useCompare();
  const pathname = usePathname();
  const show = list.length > 0 && pathname !== "/products/compare";
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-4 right-20 z-40 flex justify-start sm:right-4 sm:bottom-6 sm:justify-center"
          role="region"
          aria-label="Compare selection"
        >
          <div className="glass flex max-w-full items-center gap-2 rounded-full p-1.5 pl-2 shadow-[var(--shadow-lift)]">
            <ul className="flex -space-x-2">
              {list.map((x) => (
                <li key={x.slug} className="group/t relative">
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-canvas" title={x.title}>
                    <Img src={x.image ?? undefined} alt={x.title} className="h-full w-full object-contain mix-blend-multiply" />
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(x.slug)}
                    aria-label={`Remove ${x.title}`}
                    className="absolute -top-1 -right-1 hidden h-5 w-5 items-center justify-center rounded-full bg-ink text-white group-hover/t:flex focus-visible:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
              {Array.from({ length: COMPARE_MAX - list.length }, (_, i) => (
                <li key={`e${i}`} className="hidden h-10 w-10 rounded-full border-2 border-dashed border-line-strong bg-white/50 sm:block" aria-hidden />
              ))}
            </ul>
            <span className="hidden pl-2 text-[13px] text-muted sm:inline">{list.length === 1 ? "Add one more to compare" : `${list.length} selected`}</span>
            <button type="button" onClick={clear} aria-label="Clear compare selection" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
            <Link
              href={compareHref(list)}
              className="group/btn inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white no-underline transition-colors hover:bg-ink-2"
            >
              Compare <span className="font-mono tabular text-white/60">({list.length})</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

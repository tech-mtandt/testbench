"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import Chip from "@/ui/kit/Chip";
import ServiceCard from "./ServiceCard";
import type { FamilySlug, ServiceCardData } from "./model";

type Filter = FamilySlug | "all";

/** All services with family chips. Filter lives in `?family=` so views are shareable. */
export default function ServiceGrid({
  services,
  families,
  initial,
}: {
  services: ServiceCardData[];
  families: { slug: FamilySlug; title: string }[];
  initial: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initial);
  const reduce = useReducedMotion();
  const shown = filter === "all" ? services : services.filter((s) => s.family === filter);

  const pick = (f: Filter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("family");
    else url.searchParams.set("family", f);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-8 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter services by family">
        <Chip active={filter === "all"} onClick={() => pick("all")} count={services.length}>
          All services
        </Chip>
        {families.map((f) => (
          <Chip key={f.slug} active={filter === f.slug} onClick={() => pick(f.slug)} count={services.filter((s) => s.family === f.slug).length}>
            {f.title}
          </Chip>
        ))}
        <p className="ml-auto hidden font-mono text-xs text-subtle tabular sm:block" aria-live="polite">
          {shown.length} of {services.length}
        </p>
      </div>
      <motion.ul layout={!reduce} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((s) => (
            <motion.li
              key={s.slug}
              layout={!reduce}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <ServiceCard s={s} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

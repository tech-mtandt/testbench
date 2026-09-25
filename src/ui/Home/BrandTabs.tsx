"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Img from "@/ui/Img";
import Chip from "@/ui/kit/Chip";

export type BrandTab = {
  label: string;
  brands: { logo: string | null; alt: string; title: string; text: string; href: string | null }[];
};

export default function BrandTabs({ tabs }: { tabs: BrandTab[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {tabs.map((t, i) => (
          <Chip key={t.label} active={i === active} onClick={() => setActive(i)} count={t.brands.length}>
            {t.label}
          </Chip>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {tabs[active].brands.map((b, i) => {
            const inner = (
              <>
                <div className="flex h-14 items-center">
                  <Img src={b.logo ?? undefined} alt={b.alt || b.title} className="max-h-full max-w-[70%] object-contain" />
                </div>
                <div className="mt-5">
                  {b.title && <p className="text-sm font-semibold capitalize leading-tight text-ink">{b.title.toLowerCase()}</p>}
                  {b.text && <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted">{b.text}</p>}
                </div>
                {b.href && b.href !== "#" && (
                  <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
                )}
              </>
            );
            const cls = "group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 no-underline transition-[border-color,box-shadow] duration-500 hover:border-line-strong hover:shadow-[var(--shadow-soft)]";
            if (!b.href || b.href === "#") return <div key={i} className={cls}>{inner}</div>;
            const ext = b.href.startsWith("http");
            return (
              <a key={i} href={b.href} className={cls} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {inner}
              </a>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

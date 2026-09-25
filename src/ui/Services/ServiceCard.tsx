import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FallbackImg from "./FallbackImg";
import type { ServiceCardData } from "./model";

const familyLabel: Record<string, string> = { cesl: "Training", equipr: "Equipment", eat: "Rope access" };

/** Photo card for one service. Hook-free so it works in server and client trees. */
export default function ServiceCard({ s, compact }: { s: ServiceCardData; compact?: boolean }) {
  return (
    <Link
      href={`/services/${s.slug}`}
      className="card card-hover group flex h-full flex-col overflow-hidden no-underline"
    >
      <div className={`relative overflow-hidden bg-line ${compact ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <FallbackImg
          sources={s.images}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        {s.family && (
          <span className="glass absolute top-3 left-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink">
            {familyLabel[s.family]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base leading-snug sm:text-lg">{s.title}</h3>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>
        {!compact && s.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{s.excerpt}</p>}
      </div>
    </Link>
  );
}

import Link from "next/link";
import { ViewTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CardData } from "@/content/catalog-view";
import Img from "@/ui/Img";
import CompareToggle from "./CompareToggle";

export function ModeBadges({ modes, className = "" }: { modes: CardData["modes"]; className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {modes.map((m) => (
        <span
          key={m}
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] ${
            m === "rent" ? "bg-ink text-white" : "border border-line-strong bg-white text-ink"
          }`}
        >
          {m === "buy" ? "Buy" : "Rent"}
        </span>
      ))}
    </div>
  );
}

export function SpecGrid({ specs, className = "" }: { specs: CardData["specs"]; className?: string }) {
  if (!specs.length) return null;
  return (
    <dl className={`grid gap-x-3 ${className}`} style={{ gridTemplateColumns: `repeat(${specs.length}, minmax(0, 1fr))` }}>
      {specs.map((s) => (
        <div key={s.label} className="min-w-0">
          <dt className="truncate text-[11px] text-subtle" title={s.label}>
            {s.label}
          </dt>
          <dd className="mt-0.5 truncate font-mono text-[13px] text-ink tabular" title={s.value}>
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Grid card for one catalog item. Server component; the compare toggle is the only client island. */
export default function ProductCard({ item, priority }: { item: CardData; priority?: boolean }) {
  const photo = item.kind === "system";
  return (
    <article className="group card card-hover relative flex h-full flex-col overflow-hidden">
      <Link href={item.href} className="flex h-full flex-col no-underline" aria-label={`${item.title}${item.model ? ` ${item.model}` : ""}`}>
        <div className={`relative m-2 mb-0 aspect-[4/3] overflow-hidden rounded-[14px] ${photo ? "bg-line" : "bg-canvas"}`}>
          <ViewTransition name={`product-${item.slug}`} share="morph">
            <Img
              src={item.image ?? undefined}
              alt=""
              loading={priority ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 ${
                photo ? "object-cover" : "object-contain p-5 mix-blend-multiply"
              }`}
            />
          </ViewTransition>
          <ModeBadges modes={item.modes} className="absolute bottom-2.5 left-2.5" />
        </div>
        <div className="flex flex-1 flex-col p-5 pt-4">
          <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-subtle">{item.subcategoryName}</p>
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-medium leading-snug text-ink">{item.title}</h3>
          {item.model && <p className="mt-1 truncate font-mono text-xs text-muted">{item.model}</p>}
          {photo && item.summary && <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{item.summary}</p>}
          <div className="mt-auto pt-4">
            {item.specs.length > 0 ? (
              <SpecGrid specs={item.specs} className="border-t border-line pt-3.5" />
            ) : (
              <span className="flex items-center gap-1 border-t border-line pt-3.5 text-[13px] font-medium text-ink">
                View details <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="absolute top-4 right-4">
        <CompareToggle item={{ slug: item.slug, title: item.title, image: item.image }} />
      </div>
    </article>
  );
}

/** Large editorial card for "system" categories (fall protection, road mats, nets, tools). */
export function SystemCard({ item, index }: { item: CardData; index: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white transition-[box-shadow,border-color] duration-500 hover:border-line-strong hover:shadow-[var(--shadow-lift)]">
      <Link href={item.href} className="flex h-full flex-col no-underline">
        <div className="relative aspect-[16/10] overflow-hidden bg-line">
          <ViewTransition name={`product-${item.slug}`} share="morph">
            <Img
              src={item.image ?? undefined}
              alt=""
              loading={index < 2 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
          </ViewTransition>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 sm:p-7">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-white/60 tabular">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-2xl leading-tight text-white sm:text-[28px]">{item.title}</h3>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-all duration-500 group-hover:bg-brand">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">
          {item.summary && <p className="line-clamp-3 text-[15px] leading-relaxed text-muted">{item.summary}</p>}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
            <SpecGrid specs={item.specs.slice(0, 2)} className="min-w-0 flex-1" />
            <ModeBadges modes={item.modes} />
          </div>
        </div>
      </Link>
      <div className="absolute top-4 right-4">
        <CompareToggle item={{ slug: item.slug, title: item.title, image: item.image }} />
      </div>
    </article>
  );
}

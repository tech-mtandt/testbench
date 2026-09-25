import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Building2, CalendarCheck, Car, Plane, TrainFront, Warehouse, Zap, type LucideIcon } from "lucide-react";
import Img from "@/ui/Img";
import Marquee from "@/ui/kit/Marquee";
import type { CaseStudyTile } from "./model";

const icons: Record<string, LucideIcon> = {
  train: TrainFront,
  parking: Plane, // legacy used fa-parking for Aviation
  car: Car,
  bulb: Zap,
  building: Building2,
  warehouse: Warehouse,
  calendar: CalendarCheck,
};

export function IndustryIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = (name && icons[name]) || BadgeCheck;
  return <Icon className={className} aria-hidden />;
}

/** Case study card: photo, optional industry tag, title, summary. */
export function CaseStudyCard({ c, tag, dark }: { c: CaseStudyTile; tag?: string; dark?: boolean }) {
  return (
    <Link
      href={c.href}
      className={`group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] no-underline transition-[box-shadow,border-color] duration-500 ${
        dark ? "bg-graphite-2 ring-1 ring-white/5" : "border border-line bg-white hover:border-line-strong hover:shadow-[var(--shadow-lift)]"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Img
          src={c.image ?? undefined}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        {tag && (
          <span className="glass absolute top-3 left-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink">
            {tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "text-white/45" : "text-subtle"}`}>Case study</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h3 className={`text-lg leading-snug ${dark ? "text-white" : ""}`}>{c.title}</h3>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500 group-hover:bg-brand group-hover:text-ink ${
              dark ? "bg-white/10 text-white" : "bg-canvas text-ink"
            }`}
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>
        {c.text && <p className={`mt-2 line-clamp-2 text-sm leading-relaxed ${dark ? "text-white/60" : "text-muted"}`}>{c.text.replace(/^Case Study(?=\S)/, "")}</p>}
      </div>
    </Link>
  );
}

/** Client logos on a slow marquee (legacy logos are square tiles, so frame them as tiles). */
export function ClientsMarquee({ logos, title = "Trusted on site by" }: { logos: string[]; title?: string }) {
  const unique = [...new Set(logos.filter(Boolean))];
  if (!unique.length) return null;
  return (
    <section id="clients" className="scroll-mt-40 border-y border-line bg-white py-10">
      <div className="container-x mb-6 flex items-center justify-between">
        <p className="eyebrow">{title}</p>
        <p className="font-mono text-xs text-subtle tabular">{unique.length} clients</p>
      </div>
      <Marquee slow>
        {unique.map((src) => (
          <span key={src} className="block h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-white sm:h-24 sm:w-24">
            <Img src={src} alt="Client logo" className="h-full w-full object-contain opacity-90 transition-opacity hover:opacity-100" />
          </span>
        ))}
      </Marquee>
    </section>
  );
}

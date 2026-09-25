import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import Img from "@/ui/Img";
import Reveal from "./Reveal";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, dark }: { items: Crumb[]; dark?: boolean }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb">
      <ol className={`flex flex-wrap items-center gap-1 text-[13px] ${dark ? "text-white/60" : "text-muted"}`}>
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden />}
              {c.href && !last ? (
                <Link href={c.href} className={`no-underline transition-colors ${dark ? "hover:text-white" : "hover:text-ink"}`}>
                  {c.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? (dark ? "text-white" : "text-ink") : ""}>
                  {c.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Standard page header: breadcrumbs, eyebrow, large title, lead, actions, and an
 * optional image panel. Use for every interior page so they read as one system.
 */
export default function PageHero({
  title,
  eyebrow,
  description,
  crumbs,
  actions,
  image,
  imageAlt = "",
  aside,
  children,
}: {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  image?: string | null;
  imageAlt?: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const side = aside ?? (image ? (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-line">
      <Img src={image} alt={imageAlt} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  ) : null);
  return (
    <header className="pt-28 pb-12 sm:pt-32 sm:pb-16">
      <div className="container-x">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <div className={`mt-8 grid gap-10 ${side ? "lg:grid-cols-[1.1fr_1fr] lg:items-end" : ""}`}>
          <Reveal>
            {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
            <h1 className="display-lg max-w-4xl">{title}</h1>
            {description && <div className="lead mt-6 max-w-2xl">{description}</div>}
            {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
            {children}
          </Reveal>
          {side && <Reveal delay={0.1}>{side}</Reveal>}
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { ChevronRight } from "@/ui/Icons";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-xs">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => (
          <li key={i} className={`flex items-center gap-1.5 text-xs leading-none ${light ? "text-white/85" : "text-ink-soft"}`}>
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className={`no-underline hover:underline ${light ? "text-white" : "text-ink"}`}>
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? "page" : undefined}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Illustrated full-width banner with centered title, as on Contact/Catalog/Career. */
export function PageBanner({
  title,
  image,
  crumbs,
}: {
  title: string;
  image?: string | null;
  crumbs?: Crumb[];
}) {
  return (
    <section
      className="relative flex min-h-36 items-center justify-center bg-ink bg-cover bg-center md:min-h-48"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <div className="absolute inset-0 bg-black/35" />
      {crumbs && (
        <div className="default-margin absolute inset-x-0 top-3 z-10">
          <Breadcrumbs items={crumbs} light />
        </div>
      )}
      <h1 className="relative z-10 px-4 text-center text-3xl font-bold uppercase tracking-wider text-white md:text-5xl">
        {title}
      </h1>
    </section>
  );
}

export function SectionTitle({
  children,
  as: Tag = "h2",
  yellow,
  className = "",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3";
  yellow?: boolean;
  className?: string;
}) {
  return <Tag className={`section-title ${yellow ? "section-title-yellow" : ""} ${className}`}>{children}</Tag>;
}

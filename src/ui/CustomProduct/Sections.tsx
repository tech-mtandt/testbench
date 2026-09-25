import Link from "next/link";
import Img from "@/ui/Img";
import Carousel from "@/ui/Carousel";
import { PlusIcon } from "@/ui/Icons";
import type { CaseStudyCard } from "@/content/custom";

export function CenterTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mb-8 text-center text-2xl font-bold text-ink md:text-[28px] ${className}`}>{children}</h2>;
}

export function ClientLogos({ logos }: { logos: string[] }) {
  if (!logos.length) return null;
  return (
    <section className="py-12">
      <div className="default-margin">
        <CenterTitle>Our Clients</CenterTitle>
        <Carousel>
          {logos.map((src) => (
            <div
              key={src}
              className="flex h-24 w-[calc((100%-1.25rem)/2)] shrink-0 snap-start items-center justify-center sm:w-[calc((100%-3.75rem)/4)] lg:w-[calc((100%-6.25rem)/6)]"
            >
              <Img src={src} alt="Client logo" className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function RelatedProducts({ items }: { items: { title: string; href: string; image: string | null }[] }) {
  if (!items.length) return null;
  return (
    <section className="py-12">
      <div className="default-margin">
        <CenterTitle>Related Products</CenterTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col items-center bg-white px-4 pb-10 pt-6 text-center text-ink no-underline shadow-[0_0_10px_rgba(0,0,0,0.12)]"
            >
              <div className="flex aspect-square w-full items-center justify-center">
                <Img src={p.image ?? undefined} alt={p.title} className="max-h-full w-full object-contain" />
              </div>
              <h3 className="mt-3 text-sm font-semibold uppercase">{p.title}</h3>
              <span className="-mb-14 mt-4 flex h-8 w-8 items-center justify-center rounded-full bg-brand transition-transform group-hover:scale-110">
                <PlusIcon className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CaseStudyCards({ items, title = "Case Studies" }: { items: CaseStudyCard[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section className="bg-surface py-12">
      <div className="default-margin">
        <CenterTitle>{title}</CenterTitle>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <article key={c.href ?? c.title} className="bg-white p-2 text-center shadow-[0_0_12px_rgba(0,0,0,0.12)]">
              {c.href ? (
                <Link href={c.href} className="block aspect-[7/5] overflow-hidden">
                  <Img src={c.image ?? undefined} alt={c.title} className="h-full w-full object-cover" />
                </Link>
              ) : (
                <Img src={c.image ?? undefined} alt={c.title} className="aspect-[7/5] w-full object-cover" />
              )}
              <div className="px-3 pb-5 pt-4">
                <h3 className="text-sm font-bold uppercase text-ink">{c.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{c.text}</p>
                {c.href && (
                  <Link href={c.href} className="btn-yellow mt-5">
                    View More
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Title banner used by the industry and case-study templates (legacy `sub_header_title`). */
export function TitleBanner({ title, image, crumbs }: { title: string; image?: string | null; crumbs: React.ReactNode }) {
  return (
    <section
      className="relative min-h-36 bg-neutral-400 bg-cover bg-center md:min-h-[220px]"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <div className="absolute inset-0 bg-white/30" />
      <div className="default-margin relative pb-10 pt-3">
        {crumbs}
        {title && <h1 className="mt-8 px-0 text-2xl font-bold text-ink md:mt-12 md:px-4 md:text-[28px]">{title}</h1>}
      </div>
    </section>
  );
}

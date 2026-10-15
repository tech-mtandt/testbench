import type { ReactNode } from "react";
import type { HeroMedia } from "@/content/landing";
import { Breadcrumbs, type Crumb } from "@/ui/PageChrome";
import { PhoneIcon } from "@/ui/Icons";

/**
 * Full-bleed landing hero: an optional muted looping video (poster for slow connections and
 * reduced motion) under a dark gradient, the page title and one line of copy, a primary
 * "Get a quote" action, call and brochure actions, and a strip of short facts.
 */
export default function LandingHero({
  eyebrow,
  title,
  subtitle,
  crumbs,
  media,
  phone,
  brochure,
  facts,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  crumbs: Crumb[];
  media: HeroMedia;
  phone: { label: string; href: string };
  /** The brochure button (a server component that keeps the PDF link server-side). */
  brochure?: ReactNode;
  facts: string[];
}) {
  return (
    <section className="relative isolate flex min-h-[78svh] flex-col overflow-hidden bg-ink text-white md:min-h-[82vh]">
      {/* Media: video when given, else a quiet brand backdrop. */}
      {media.video ? (
        <>
          {media.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.poster} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          )}
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
            src={media.video}
            poster={media.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        </>
      ) : (
        <div aria-hidden className="landing-backdrop absolute inset-0 -z-20" />
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" />

      <div className="default-margin w-full pt-4">
        <Breadcrumbs items={crumbs} light />
      </div>

      <div className="default-margin flex w-full flex-1 flex-col justify-end pb-10 pt-16 md:pb-14">
        <div className="landing-rise max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-ink/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {subtitle && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">{subtitle}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#quote" className="btn-yellow px-7 py-3 no-underline">
              Get a quote
            </a>
            <a
              href={phone.href}
              className="inline-flex items-center gap-2 rounded border border-white/40 px-5 py-3 text-sm font-semibold text-white no-underline backdrop-blur-sm transition-colors hover:border-white hover:bg-white/10"
            >
              <PhoneIcon className="h-4 w-4" /> {phone.label}
            </a>
            {brochure}
          </div>
        </div>
      </div>

      {facts.length > 0 && (
        <div className="border-t border-white/10 bg-ink/60 backdrop-blur-sm">
          <ul className="default-margin flex flex-wrap items-center gap-x-6 gap-y-2 py-4 text-sm text-white/90 md:gap-x-10">
            {facts.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

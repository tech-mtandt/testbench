import type { CSSProperties, ReactNode } from "react";
import type { HeroMedia } from "@/content/landing";
import { Breadcrumbs, type Crumb } from "@/ui/PageChrome";
import { PhoneIcon } from "@/ui/Icons";

/**
 * Full-bleed landing hero: an optional muted looping video (poster for slow connections and
 * reduced motion) under a dark gradient, the page title and one line of copy, a primary
 * "Get a quote" action, call and brochure actions, and a strip of short facts.
 *
 * With a video, the banner takes the video's shape (the wide cut on landscape screens, the
 * tall cut on portrait ones), so the whole frame shows. It only grows past that shape when
 * the text needs more room, and stops at about the screen's height.
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
  const { wide, tall } = media;
  const main = wide ?? tall;
  // The tall cut replaces the wide one on portrait screens.
  const portrait = wide && tall ? tall : null;
  // Height from the full-bleed width at the video's shape (e.g. 1920×800 -> 41.67vw).
  const shape = {
    ...(wide && {
      "--hero-wide": `${((wide.height / wide.width) * 100).toFixed(2)}vw`,
    }),
    ...(tall && {
      "--hero-tall": `${((tall.height / tall.width) * 100).toFixed(2)}vw`,
    }),
  } as CSSProperties;
  const height = [
    wide
      ? "landscape:min-h-[min(var(--hero-wide),90svh)]"
      : "landscape:min-h-[82vh]",
    tall
      ? "portrait:min-h-[min(var(--hero-tall),100svh)]"
      : "portrait:min-h-[78svh]",
  ].join(" ");

  return (
    <section
      className={`relative isolate flex flex-col overflow-hidden bg-ink text-white ${height}`}
      style={shape}
    >
      {/* Media: video when given, else a quiet brand backdrop. */}
      {main ? (
        <>
          {/* Poster: shown while the video loads (a video set in the admin may have none). */}
          {main.poster && (
            <picture>
              {portrait?.poster && (
                <source
                  media="(orientation: portrait)"
                  srcSet={portrait.poster}
                />
              )}
              <img
                src={main.poster}
                alt=""
                className="absolute inset-0 -z-20 h-full w-full object-cover"
              />
            </picture>
          )}
          <video
            className="absolute inset-0 -z-20 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          >
            {portrait && (
              <source
                media="(orientation: portrait)"
                src={portrait.src}
                type="video/mp4"
              />
            )}
            <source src={main.src} type="video/mp4" />
          </video>
        </>
      ) : (
        <div aria-hidden className="landing-backdrop absolute inset-0 -z-20" />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent"
      />

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
          {subtitle && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              {subtitle}
            </p>
          )}
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
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand"
                />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

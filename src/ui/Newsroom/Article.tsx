import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Img from "@/ui/Img";
import { Breadcrumbs } from "@/ui/kit/PageHero";
import Reveal from "@/ui/kit/Reveal";
import { RailItem } from "./Cards";
import { fmtDate, TYPE_LABEL, type FeedItem } from "./data";
import Gallery, { type GalleryEntry } from "./Gallery";
import Share from "./Share";

type Kind = FeedItem["kind"];
type Nav = { href: string; title: string } | null;

const listCrumb: Record<Kind, { label: string; href: string }> = {
  articles: { label: "Articles", href: "/media?type=articles" },
  press: { label: "Press", href: "/media?type=press" },
  events: { label: "Events", href: "/media?type=events" },
};

/**
 * Shared newsroom detail template (articles, press releases, events): reading-width
 * header, rounded hero, prose body, tags, share, prev/next and a sticky "More stories" rail.
 */
export default function Article({
  kind,
  title,
  category,
  date,
  dateLabel,
  minutes,
  lead,
  hero,
  heroAspect = "aspect-[16/9]",
  facts,
  children,
  gallery,
  tags = [],
  path,
  more,
  prev,
  next,
}: {
  kind: Kind;
  title: string;
  category?: string | null;
  date: string | null;
  dateLabel?: string;
  minutes?: number;
  lead?: string | null;
  hero?: string | null;
  heroAspect?: string;
  facts?: ReactNode;
  children: ReactNode;
  gallery?: GalleryEntry[];
  tags?: string[];
  path: string;
  more: FeedItem[];
  prev?: Nav;
  next?: Nav;
}) {
  const when = dateLabel ?? fmtDate(date, "long");
  const eyebrow = [TYPE_LABEL[kind], category].filter(Boolean).join(" · ");
  const uniqTags = [...new Set(tags.map((t) => t.trim()).filter(Boolean))];

  return (
    <article className="pt-28 pb-20 sm:pt-32 sm:pb-28">
      <div className="container-x">
        <Breadcrumbs items={[{ label: "Newsroom", href: "/media" }, listCrumb[kind], { label: title }]} />

        <Reveal className="mt-8 max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 text-[clamp(2rem,4.4vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.04em]">{title}</h1>
          {lead && <p className="lead mt-6 max-w-3xl">{lead}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted tabular">
              {date && <time dateTime={date.slice(0, 10)}>{when}</time>}
              {minutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {minutes} min read
                </span>
              )}
            </p>
            <Share path={path} title={title} />
          </div>
        </Reveal>

        {hero && (
          <Reveal delay={0.08} className={`relative mt-10 overflow-hidden rounded-[var(--radius-panel)] bg-line ${heroAspect}`}>
            <Img src={hero} alt="" loading="eager" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
        )}

        <div className="mt-12 grid grid-cols-1 gap-14 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 xl:gap-24">
          <div className="min-w-0">
            {facts && <div className="mb-10">{facts}</div>}
            <div className="max-w-[70ch]">{children}</div>

            {gallery && gallery.length > 0 && (
              <section className="mt-12" aria-labelledby="photos">
                <h2 id="photos" className="mb-5 text-xl">
                  Photos
                </h2>
                <Gallery items={gallery} title={title} columns="columns-2 sm:columns-3" uniform />
              </section>
            )}

            {uniqTags.length > 0 && (
              <div className="mt-12 flex max-w-[70ch] flex-wrap gap-2" aria-label="Tags">
                {uniqTags.map((t) => (
                  <span key={t} className="inline-flex h-8 items-center rounded-full border border-line bg-white px-3.5 text-[13px] text-ink-2">
                    #{t.replace(/\s+/g, "")}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 flex max-w-[70ch] flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
              <p className="text-sm font-medium">Found this useful? Pass it on.</p>
              <Share path={path} title={title} label={false} />
            </div>

            {(prev || next) && (
              <nav aria-label="More in the newsroom" className="mt-10 grid max-w-[70ch] gap-3 sm:grid-cols-2">
                {prev ? (
                  <Link href={prev.href} className="group card card-hover flex flex-col p-5 no-underline">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" /> Newer
                    </span>
                    <span className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-ink">{prev.title}</span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next && (
                  <Link href={next.href} className="group card card-hover flex flex-col p-5 text-right no-underline">
                    <span className="inline-flex items-center justify-end gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">
                      Older <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-2 line-clamp-2 text-[15px] font-medium leading-snug text-ink">{next.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="More stories">
            <div className="card p-4">
              <div className="flex items-center justify-between px-2 pt-1 pb-3">
                <p className="text-sm font-semibold">More stories</p>
                <Link href="/media" className="text-[13px] text-muted no-underline hover:text-ink">
                  Newsroom
                </Link>
              </div>
              <ul className="space-y-1">
                {more.map((m) => (
                  <li key={m.key}>
                    <RailItem href={m.href} title={m.title} image={m.image} kind={m.kind} meta={`${TYPE_LABEL[m.kind]} · ${fmtDate(m.date)}`} />
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

/** Pick "more stories": same-type first, then the newest of everything else. */
export function pickMore(feed: FeedItem[], currentKey: string, kind: Kind, n = 5) {
  const rest = feed.filter((f) => f.key !== currentKey);
  const same = rest.filter((f) => f.kind === kind).slice(0, 3);
  const other = rest.filter((f) => !same.includes(f)).slice(0, n - same.length);
  return [...same, ...other].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/** Newer / older neighbours within one ordered (newest-first) list. */
export function neighbours<T>(list: T[], i: number, toNav: (x: T) => { href: string; title: string }) {
  return { prev: i > 0 ? toNav(list[i - 1]) : null, next: i >= 0 && i < list.length - 1 ? toNav(list[i + 1]) : null };
}

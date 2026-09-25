import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, FileText, MapPin, Megaphone, Newspaper } from "lucide-react";
import type { BlogCard, EventItem, PressItem } from "@/content/media";
import Img from "@/ui/Img";
import { fmtDate, fmtRange, pressExcerpt, pressSource, TYPE_LABEL, type FeedItem } from "./data";

const zoom = "transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105";

export const KindIcon = { articles: FileText, press: Megaphone, events: CalendarDays } as const;

/** Tiny type · date line used across cards. */
export function Meta({ kind, date, extra, dark }: { kind?: FeedItem["kind"]; date?: string | null; extra?: string | null; dark?: boolean }) {
  const parts = [kind ? TYPE_LABEL[kind] : null, extra, date ? fmtDate(date) : null].filter(Boolean);
  return <p className={`font-mono text-[11px] uppercase tracking-[0.08em] tabular ${dark ? "text-white/60" : "text-subtle"}`}>{parts.join(" · ")}</p>;
}

/** Fallback surface for missing / blocked images: keeps the aspect box and shows the type icon. */
function Thumb({ src, kind, className = "", contain }: { src: string | null; kind: FeedItem["kind"]; className?: string; contain?: boolean }) {
  const Icon = KindIcon[kind];
  return (
    <div className={`relative overflow-hidden bg-line ${className}`}>
      <Icon className="absolute top-1/2 left-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-subtle" aria-hidden />
      {src && <Img src={src} alt="" className={`absolute inset-0 h-full w-full ${contain ? "object-contain" : "object-cover"} ${zoom}`} />}
    </div>
  );
}

/** Big lead story for the "All" view. */
export function FeaturedStory({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.href}
      className="group grid overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white no-underline transition-shadow duration-500 hover:shadow-[var(--shadow-lift)] lg:grid-cols-[1.35fr_1fr]"
    >
      <Thumb src={item.image} kind={item.kind} className="aspect-[16/10] lg:aspect-auto lg:min-h-[420px]" />
      <div className="flex flex-col p-7 sm:p-10">
        <p className="eyebrow">Featured {TYPE_LABEL[item.kind].toLowerCase()}</p>
        <h2 className="mt-5 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.08] tracking-[-0.035em]">{item.title}</h2>
        {item.excerpt && <p className="mt-4 line-clamp-4 text-muted">{item.excerpt}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <Meta extra={item.label} date={item.date} />
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-ink transition-transform duration-500 group-hover:-rotate-45">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact card for secondary stories next to / under the featured one. */
export function StoryCard({ item }: { item: FeedItem }) {
  return (
    <Link href={item.href} className="group grid h-full grid-cols-[112px_minmax(0,1fr)] items-start gap-4 no-underline sm:flex sm:flex-col sm:gap-0">
      <Thumb src={item.image} kind={item.kind} className="aspect-[4/3] w-full rounded-xl sm:aspect-[16/10] sm:rounded-[var(--radius-card)]" />
      <div className="sm:mt-4">
        <Meta kind={item.kind} date={item.date} />
        <h3 className="mt-1.5 line-clamp-3 text-base leading-snug">{item.title}</h3>
      </div>
    </Link>
  );
}

/** Row in the mixed "latest" feed. */
export function FeedRow({ item }: { item: FeedItem }) {
  const Icon = KindIcon[item.kind];
  return (
    <Link
      href={item.href}
      className="group grid grid-cols-[96px_minmax(0,1fr)] items-start gap-4 rounded-[var(--radius-card)] p-3 no-underline transition-colors hover:bg-white sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:gap-6 sm:p-4"
    >
      <Thumb src={item.image} kind={item.kind} className="aspect-[4/3] rounded-xl" />
      <div className="min-w-0 py-0.5">
        <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-subtle tabular">
          <Icon className="h-3.5 w-3.5 text-ink" aria-hidden />
          <span className="text-ink">{TYPE_LABEL[item.kind]}</span>
          <span aria-hidden>·</span>
          {fmtDate(item.date)}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug sm:text-lg">{item.title}</h3>
        {item.excerpt && <p className="mt-1.5 hidden line-clamp-2 text-sm text-muted sm:block">{item.excerpt}</p>}
      </div>
      <span className="hidden h-10 w-10 items-center justify-center self-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand sm:flex">
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
      </span>
    </Link>
  );
}

export function ArticleCard({ post }: { post: BlogCard }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="group flex h-full flex-col no-underline">
      <div className="relative">
        <Thumb src={post.image} kind="articles" className="aspect-[4/3] rounded-[var(--radius-card)]" />
        {post.category && (
          <span className="glass absolute top-3 left-3 max-w-[calc(100%-24px)] truncate rounded-full px-2.5 py-1 text-[11px] font-medium text-ink">
            {post.category}
          </span>
        )}
      </div>
      <p className="mt-4 font-mono text-[11px] text-subtle tabular">{fmtDate(post.date)}</p>
      <h3 className="mt-1 line-clamp-3 text-base leading-snug sm:text-[17px]">{post.title}</h3>
      {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>}
    </Link>
  );
}

export function PressRow({ item, lead }: { item: PressItem; lead?: boolean }) {
  return (
    <Link
      href={`/press/${item.slug}`}
      className={`group grid gap-5 rounded-[var(--radius-card)] border border-line bg-white p-4 no-underline card-hover sm:p-5 ${
        lead ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-10 lg:p-6" : "sm:grid-cols-[minmax(0,1fr)_240px] sm:gap-8"
      }`}
    >
      <div className={`order-2 flex min-w-0 flex-col ${lead ? "lg:order-1 lg:py-4" : "sm:order-1"}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.08em] text-subtle tabular">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <Newspaper className="h-3.5 w-3.5" aria-hidden />
            {pressSource(item)}
          </span>
          <time dateTime={item.date ?? undefined}>{fmtDate(item.date, "long")}</time>
        </p>
        <h3 className={`mt-3 leading-snug ${lead ? "text-[clamp(1.4rem,2.2vw,2rem)] tracking-[-0.03em]" : "text-lg"}`}>{item.cardTitle || item.title}</h3>
        <p className={`mt-3 text-sm text-muted ${lead ? "line-clamp-4 sm:text-base" : "line-clamp-2"}`}>{pressExcerpt(item, lead ? 260 : 160)}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-ink">
          {pressSource(item) === "Press release" ? "Read release" : "Read story"} <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className={`order-1 ${lead ? "lg:order-2" : "sm:order-2"}`}>
        <div className="relative aspect-[2/1] overflow-hidden rounded-xl bg-canvas">
          {item.image && <Img src={item.image} alt="" className={`absolute inset-0 h-full w-full object-cover ${zoom}`} />}
        </div>
      </div>
    </Link>
  );
}

export function EventRow({ e, facts }: { e: EventItem; facts: { stall: string | null } }) {
  return (
    <Link
      href={`/event/${e.slug}`}
      className="group grid grid-cols-[104px_minmax(0,1fr)] items-center gap-4 rounded-[var(--radius-card)] border border-line bg-white p-3 no-underline card-hover sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:gap-6 sm:p-4"
    >
      <Thumb src={e.thumb} kind="events" className="aspect-[3/2] rounded-xl" />
      <div className="min-w-0">
        <p className="font-mono text-xs text-ink tabular">{fmtRange(e.from, e.to)}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] leading-snug sm:text-lg">{e.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          {e.location && (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="line-clamp-1">{e.location}</span>
            </span>
          )}
          {facts.stall && <span className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[11px] text-ink-2">Stall {facts.stall}</span>}
        </div>
      </div>
      <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand sm:flex">
        <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
      </span>
    </Link>
  );
}

/** Rail list item (events rail, "More stories"). */
export function RailItem({ href, title, meta, image, kind }: { href: string; title: string; meta: string; image: string | null; kind: FeedItem["kind"] }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-xl p-2 no-underline transition-colors hover:bg-canvas">
      <Thumb src={image} kind={kind} className="aspect-[4/3] w-20 shrink-0 rounded-lg" />
      <span className="min-w-0 pt-0.5">
        <span className="block font-mono text-[11px] text-subtle tabular">{meta}</span>
        <span className="mt-0.5 line-clamp-2 block text-sm font-medium leading-snug text-ink">{title}</span>
      </span>
    </Link>
  );
}

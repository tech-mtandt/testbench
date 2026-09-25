import Link from "next/link";
import { ArrowRight, CalendarClock, Images, SearchX } from "lucide-react";
import type { BlogCard, EventItem, GalleryItem, PressItem } from "@/content/media";
import Img from "@/ui/Img";
import { Button } from "@/ui/kit/Button";
import Chip from "@/ui/kit/Chip";
import { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { ArticleCard, EventRow, FeaturedStory, FeedRow, PressRow, RailItem, StoryCard } from "./Cards";
import { BLOGS_PER_PAGE, catKey, eventFacts, eventYear, fmtRange, isUpcoming, type FeedItem } from "./data";
import Gallery from "./Gallery";
import Pagination from "./Pagination";

export function Empty({ q, reset = "/media" }: { q?: string; reset?: string }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas">
        <SearchX className="h-5 w-5 text-muted" />
      </span>
      <h3 className="mt-5 text-lg">{q ? <>Nothing matches “{q}”</> : "Nothing here yet"}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">Try a shorter search, or browse everything in the newsroom.</p>
      <Button href={reset} variant="outline" size="sm" className="mt-6">
        Clear filters
      </Button>
    </div>
  );
}

function Count({ n, noun, q }: { n: number; noun: string; q?: string }) {
  return (
    <p className="font-mono text-xs text-muted tabular">
      {n} {noun}
      {n === 1 ? "" : "s"}
      {q ? <> for “{q}”</> : null}
    </p>
  );
}

/* ------------------------------------------------------------------ all */

export function AllView({ feed, events, gallery, q }: { feed: FeedItem[]; events: EventItem[]; gallery: GalleryItem[]; q: string }) {
  if (q) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 px-3">
          <Count n={feed.length} noun="result" q={q} />
        </div>
        {feed.length ? (
          <Stagger className="divide-y divide-line">
            {feed.slice(0, 60).map((f) => (
              <StaggerItem key={f.key}>
                <FeedRow item={f} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Empty q={q} />
        )}
      </div>
    );
  }

  const lead = feed.find((f) => f.kind === "articles") ?? feed[0];
  const picks = [
    feed.find((f) => f.kind === "press"),
    feed.find((f) => f.kind === "events"),
    feed.find((f) => f.kind === "articles" && f !== lead),
  ].filter((f): f is FeedItem => !!f);
  const shown = new Set([lead, ...picks].map((f) => f?.key));
  const latest = feed.filter((f) => !shown.has(f.key)).slice(0, 10);
  const upcoming = events.filter((e) => isUpcoming(e)).sort((a, b) => (a.from ?? "").localeCompare(b.from ?? ""));
  const recent = events.filter((e) => !isUpcoming(e)).slice(0, 5);
  const photos = gallery.filter((g) => g.type === "image").slice(0, 4);

  return (
    <>
      {lead && <FeaturedStory item={lead} />}
      <Stagger className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5">
        {picks.map((p) => (
          <StaggerItem key={p.key}>
            <StoryCard item={p} />
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <section aria-labelledby="latest">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="eyebrow mb-3">Latest</p>
              <h2 id="latest" className="display-md">
                Everything, newest first.
              </h2>
            </div>
          </div>
          <Stagger className="-mx-3 divide-y divide-line sm:-mx-4">
            {latest.map((f) => (
              <StaggerItem key={f.key}>
                <FeedRow item={f} />
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button href="/media?type=articles" variant="dark" icon={<ArrowRight className="h-4 w-4" />}>
              All articles
            </Button>
            <Button href="/media?type=press" variant="outline">
              Press
            </Button>
            <Button href="/media?type=events" variant="outline">
              Events
            </Button>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="card p-4">
            <div className="flex items-center justify-between px-2 pt-1 pb-3">
              <p className="text-sm font-semibold">Upcoming events</p>
              <Link href="/media?type=events" className="text-[13px] text-muted no-underline hover:text-ink">
                All events
              </Link>
            </div>
            {upcoming.length ? (
              <ul className="space-y-1">
                {upcoming.slice(0, 3).map((e) => (
                  <li key={e.slug}>
                    <RailItem href={`/event/${e.slug}`} title={e.title} image={e.thumb} kind="events" meta={fmtRange(e.from, e.to)} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mx-2 flex items-start gap-3 rounded-xl bg-canvas p-4 text-sm text-muted">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <span>No shows announced right now — our next exhibitions will be listed here.</span>
              </div>
            )}
            <p className="mt-4 border-t border-line px-2 pt-4 pb-2 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">Recent</p>
            <ul className="space-y-1">
              {recent.map((e) => (
                <li key={e.slug}>
                  <RailItem href={`/event/${e.slug}`} title={e.title} image={e.thumb} kind="events" meta={fmtRange(e.from, e.to)} />
                </li>
              ))}
            </ul>
          </div>

          <Link href="/media?type=gallery" className="group card block overflow-hidden p-2 no-underline card-hover">
            <div className="grid grid-cols-2 gap-1.5">
              {photos.map((g) => (
                <div key={g.src} className="relative aspect-square overflow-hidden rounded-xl bg-line">
                  <Img src={g.src} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-3 pt-4 pb-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <Images className="h-4 w-4" /> Photos & videos
              </span>
              <ArrowRight className="h-4 w-4 text-ink transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </Link>
        </aside>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ articles */

export function ArticlesView({
  cards,
  categories,
  cat,
  page,
  q,
}: {
  cards: BlogCard[];
  categories: { key: string; label: string; count: number }[];
  cat: string;
  page: number;
  q: string;
}) {
  const total = cards.length;
  const totalPages = Math.max(1, Math.ceil(total / BLOGS_PER_PAGE));
  const p = Math.min(page, totalPages);
  const slice = cards.slice((p - 1) * BLOGS_PER_PAGE, p * BLOGS_PER_PAGE);
  const href = (o: { cat?: string; page?: number }) => {
    const s = new URLSearchParams({ type: "articles" });
    const c = o.cat ?? cat;
    if (c) s.set("cat", c);
    if (q) s.set("q", q);
    if (o.page && o.page > 1) s.set("page", String(o.page));
    return `/media?${s}`;
  };
  const activeLabel = categories.find((c) => c.key === cat)?.label ?? (cat ? cards[0]?.category : null);

  return (
    <>
      <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip href={href({ cat: "" })} active={!cat} scroll={false}>
          All topics
        </Chip>
        {categories.map((c) => (
          <Chip key={c.key} href={href({ cat: c.key })} active={c.key === cat} count={c.count} scroll={false}>
            {c.label}
          </Chip>
        ))}
      </div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Count n={total} noun={activeLabel ? `${activeLabel} article` : "article"} q={q} />
        {totalPages > 1 && (
          <p className="font-mono text-xs text-subtle tabular">
            Page {p} of {totalPages}
          </p>
        )}
      </div>
      {slice.length ? (
        <Stagger className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slice.map((b) => (
            <StaggerItem key={b.slug}>
              <ArticleCard post={b} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <Empty q={q} reset="/media?type=articles" />
      )}
      <Pagination page={p} totalPages={totalPages} href={(n) => `${href({ page: n })}#feed`} />
    </>
  );
}

export const filterByCat = (cards: BlogCard[], cat: string) => (cat ? cards.filter((c) => c.category && catKey(c.category) === cat) : cards);

/* ------------------------------------------------------------------ press */

export function PressView({ items, q }: { items: PressItem[]; q: string }) {
  if (!items.length) return <Empty q={q} reset="/media?type=press" />;
  const [lead, ...rest] = items;
  return (
    <>
      <div className="mb-6">
        <Count n={items.length} noun="press item" q={q} />
      </div>
      <PressRow item={lead} lead />
      <Stagger className="mt-4 grid gap-4 lg:grid-cols-2">
        {rest.map((p) => (
          <StaggerItem key={p.slug}>
            <PressRow item={p} />
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] border border-line bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">Media enquiries</p>
          <p className="mt-1 text-sm text-muted">Interviews, product imagery or statements — our communications team will help.</p>
        </div>
        <Button href="/contact" variant="dark" icon={<ArrowRight className="h-4 w-4" />}>
          Contact us
        </Button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ events */

export function EventsView({ items, q }: { items: EventItem[]; q: string }) {
  if (!items.length) return <Empty q={q} reset="/media?type=events" />;
  const upcoming = items.filter((e) => isUpcoming(e)).sort((a, b) => (a.from ?? "").localeCompare(b.from ?? ""));
  const past = items.filter((e) => !isUpcoming(e));
  const years = [...new Set(past.map(eventYear))].sort((a, b) => b - a);

  return (
    <>
      <section aria-labelledby="upcoming" className="mb-16">
        <div className="mb-5 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-brand ring-4 ring-brand/30" />
          <h2 id="upcoming" className="text-xl">
            Upcoming
          </h2>
          <span className="font-mono text-xs text-subtle tabular">{upcoming.length}</span>
        </div>
        {upcoming.length ? (
          <div className="grid gap-3">
            {upcoming.map((e) => (
              <EventRow key={e.slug} e={e} facts={eventFacts(e)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-dashed border-line-strong p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm text-muted">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              {q ? "No upcoming events match your search." : "No exhibitions announced right now. Want a demo before the next show? We’ll bring the machine to you."}
            </p>
            <Button href="/contact" variant="outline" size="sm">
              Request a demo
            </Button>
          </div>
        )}
      </section>

      {years.map((y) => {
        const list = past.filter((e) => eventYear(e) === y);
        return (
          <section key={y} aria-labelledby={`y-${y}`} className="grid grid-cols-1 gap-4 border-t border-line pt-8 pb-12 lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-10">
            <div className="lg:sticky lg:top-40 lg:self-start">
              <h2 id={`y-${y}`} className="font-mono text-4xl font-medium tracking-[-0.04em] tabular sm:text-5xl">
                {y || "—"}
              </h2>
              <p className="mt-1 font-mono text-xs text-subtle">
                {list.length} event{list.length === 1 ? "" : "s"}
              </p>
            </div>
            <Stagger className="relative grid gap-3 lg:border-l lg:border-line lg:pl-10">
              {list.map((e) => (
                <StaggerItem key={e.slug} className="relative">
                  <span aria-hidden className="absolute top-1/2 -left-[45px] hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-canvas bg-line-strong lg:block" />
                  <EventRow e={e} facts={eventFacts(e)} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ gallery */

export function GalleryView({ items }: { items: GalleryItem[] }) {
  const photos = items.filter((i) => i.type === "image").length;
  return (
    <>
      <div className="mb-6">
        <p className="font-mono text-xs text-muted tabular">
          {photos} photos · {items.length - photos} videos
        </p>
      </div>
      <Gallery items={items} title="Mtandt gallery" />
    </>
  );
}

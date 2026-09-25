import type { Metadata } from "next";
import { gallery } from "@/content/media";
import PageHero from "@/ui/kit/PageHero";
import Reveal from "@/ui/kit/Reveal";
import {
  allBlogCards,
  blogCategories,
  catKey,
  matches,
  mixedFeed,
  parsePage,
  parseStr,
  parseType,
  sortedEvents,
  sortedPress,
  type NewsType,
} from "@/ui/Newsroom/data";
import FilterBar from "@/ui/Newsroom/FilterBar";
import { AllView, ArticlesView, EventsView, filterByCat, GalleryView, PressView } from "@/ui/Newsroom/Views";

type SP = Promise<Record<string, string | string[] | undefined>>;

const META: Record<NewsType, { title: string; description: string }> = {
  all: { title: "Newsroom", description: "News, articles, press releases, events and photos from Mtandt Group — access equipment, work at height safety and rentals since 1974." },
  articles: { title: "Articles", description: "Insights, guides and updates from Mtandt Group on access equipment, work at height safety and rentals." },
  press: { title: "Press", description: "Press releases and media coverage of Mtandt Group." },
  events: { title: "Events", description: "Trade shows, exhibitions and industry events featuring Mtandt Group." },
  gallery: { title: "Gallery", description: "Photos and videos of Mtandt Group equipment, projects and solutions on site." },
};

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const type = parseType(sp.type);
  const page = parsePage(sp.page);
  const filtered = !!parseStr(sp.q) || !!parseStr(sp.cat);
  const canonical = type === "all" ? "/media" : `/media?type=${type}${type === "articles" && page > 1 ? `&page=${page}` : ""}`;
  return {
    title: type === "all" ? META.all.title : `${META[type].title} — Newsroom`,
    description: META[type].description,
    alternates: { canonical },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const type = parseType(sp.type);
  const q = parseStr(sp.q);
  const cat = catKey(parseStr(sp.cat));
  const page = parsePage(sp.page);
  const hit = matches(q);

  const [cards, feed] = await Promise.all([allBlogCards(), mixedFeed()]);
  const press = sortedPress();
  const events = sortedEvents();

  const counts = {
    all: feed.length,
    articles: cards.length,
    press: press.length,
    events: events.length,
    gallery: gallery.length,
  };

  let view: React.ReactNode;
  switch (type) {
    case "articles":
      view = (
        <ArticlesView
          cards={filterByCat(cards, cat).filter((c) => hit(c.title) || hit(c.category))}
          categories={blogCategories(cards)}
          cat={cat}
          page={page}
          q={q}
        />
      );
      break;
    case "press":
      view = <PressView items={press.filter((p) => hit(p.title) || hit(p.cardTitle))} q={q} />;
      break;
    case "events":
      view = <EventsView items={events.filter((e) => hit(e.title) || hit(e.location))} q={q} />;
      break;
    case "gallery":
      view = <GalleryView items={gallery} />;
      break;
    default:
      view = <AllView feed={q ? feed.filter((f) => hit(f.title)) : feed} events={events} gallery={gallery} q={q} />;
  }

  const stats = [
    { n: counts.articles, label: "Articles" },
    { n: counts.press, label: "Press items" },
    { n: counts.events, label: "Events" },
    { n: counts.gallery, label: "Photos & videos" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Newsroom" }]}
        eyebrow="Media"
        title="Newsroom"
        description="Stories from the field, company news, the shows we exhibit at and the machines at work — all in one place."
        aside={
          <dl className="hidden grid-cols-2 sm:grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line">
            {stats.map((s) => (
              <div key={s.label} className="bg-white p-5 sm:p-6">
                <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">{s.label}</dt>
                <dd className="mt-3 text-4xl font-semibold tracking-[-0.04em] tabular sm:text-5xl">{s.n}</dd>
              </div>
            ))}
          </dl>
        }
      />
      <FilterBar type={type} q={q} counts={counts} />
      <div id="feed" className="scroll-mt-40" />
      <section className="pt-10 pb-20 sm:pt-12 sm:pb-28">
        <div className="container-x">
          <Reveal key={`${type}|${q}|${cat}|${page}`} y={12}>
            {view}
          </Reveal>
        </div>
      </section>
    </>
  );
}

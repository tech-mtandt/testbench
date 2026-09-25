import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { events, getEvent } from "@/content/media";
import Article, { neighbours, pickMore } from "@/ui/Newsroom/Article";
import { cleanHtml, fmtRange, mixedFeed, sortedEvents } from "@/ui/Newsroom/data";
import EventFacts from "@/ui/Newsroom/EventFacts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => events.map((e) => ({ slug: e.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEvent((await params).slug);
  if (!e) return {};
  return {
    title: { absolute: e.meta.title || e.title },
    description: e.meta.description || e.excerpt,
    alternates: { canonical: `/event/${e.slug}` },
    openGraph: { images: e.thumb ? [e.thumb] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const e = getEvent((await params).slug);
  if (!e) notFound();
  const list = sortedEvents();
  const { prev, next } = neighbours(
    list,
    list.findIndex((x) => x.slug === e.slug),
    (x) => ({ href: `/event/${x.slug}`, title: x.title }),
  );
  const feed = await mixedFeed();
  const body = cleanHtml(e.body);

  return (
    <Article
      kind="events"
      title={e.title}
      date={e.from}
      dateLabel={fmtRange(e.from, e.to)}
      facts={<EventFacts e={e} />}
      gallery={e.gallery.map((src) => ({ type: "image" as const, src }))}
      tags={e.tags}
      path={`/event/${e.slug}`}
      more={pickMore(feed, `e-${e.slug}`, "events")}
      prev={prev}
      next={next}
    >
      {body.replace(/<[^>]+>/g, "").trim().length > 40 ? (
        <div className="prose-mt" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <p className="prose-mt">{e.excerpt || `Mtandt Group took part in ${e.title}${e.location ? `, ${e.location}` : ""}.`}</p>
      )}
    </Article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventRange, events, getEvent } from "@/content/media";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import Lightbox from "@/ui/Media/Lightbox";
import ShareLinks from "@/ui/Media/ShareLinks";
import Tags from "@/ui/Media/Tags";

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
  const recent = events.filter((x) => x.slug !== e.slug).slice(0, 5);

  return (
    <div className="default-margin pb-12 pt-4">
      <Breadcrumbs items={[{ label: "Media", href: "/media" }, { label: "Events", href: "/media/events" }, { label: e.title }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-[8%]">
        <article className="min-w-0">
          {e.image && <Img src={e.image} alt={e.title} loading="eager" className="mb-6 w-full max-w-[272px]" />}
          <div className="sr-only">
            <h1>{e.title}</h1>
            <p>{eventRange(e, " to ")}</p>
            <p>{e.location}</p>
          </div>
          <div
            className="prose-legacy text-ink md:text-justify [&_h1]:text-2xl [&_h1]:text-[#0b3b73] [&_h2]:text-xl [&_h2]:text-[#0b3b73] [&_h3]:text-lg [&_h3]:text-[#0b3b73] [&_li]:text-sm [&_p]:text-sm"
            dangerouslySetInnerHTML={{ __html: e.body }}
          />
          {e.gallery.length > 0 && (
            <div className="mt-6">
              <Lightbox
                title={e.title}
                items={e.gallery.map((src) => ({ type: "image" as const, src }))}
                gridClassName="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
                thumbClassName="aspect-square"
              />
            </div>
          )}
          <Tags tags={e.tags} />
          <ShareLinks path={`/event/${e.slug}`} />
        </article>
        <aside className="self-start bg-[#faf7ec]">
          <h2 className="bg-[#dcdcdc] py-3 text-center text-xl font-semibold md:text-2xl">Recent Events</h2>
          <ul className="px-2 py-2">
            {recent.map((x) => (
              <li key={x.slug} className="border-b border-brand/60 px-1 py-3">
                <Link href={`/event/${x.slug}`} className="group flex items-center gap-3 no-underline">
                  <span className="block h-[68px] w-[100px] shrink-0 overflow-hidden bg-neutral-200">
                    <Img src={x.thumb || undefined} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug text-ink group-hover:underline">{x.title}</span>
                    <span className="mt-1 block text-xs text-ink-soft/80">{eventRange(x, " ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EVENTS_PER_PAGE, eventRange, events } from "@/content/media";
import { CalendarIcon, MapPinIcon } from "@/ui/Icons";
import Img from "@/ui/Img";
import MediaBanner from "@/ui/Media/MediaBanner";
import MediaTabs from "@/ui/Media/MediaTabs";
import Pagination, { parsePage } from "@/ui/Media/Pagination";

export const metadata: Metadata = {
  title: "Events",
  description: "Trade shows, exhibitions and industry events featuring Mtandt Group.",
  alternates: { canonical: "/media/events" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePage((await searchParams).page);
  const totalPages = Math.ceil(events.length / EVENTS_PER_PAGE);
  if (page > totalPages) notFound();
  const list = events.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  return (
    <>
      <MediaBanner />
      <MediaTabs active="events" />
      <div className="mx-auto w-full max-w-[1000px] px-4 py-8 md:px-8 md:py-10">
        <ul className="space-y-5">
          {list.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/event/${e.slug}`}
                className="group grid items-center gap-5 border-b-2 border-brand-light bg-[#fcfcfc] p-5 no-underline shadow-[0_0_6px_rgb(0_0_0/.06)] md:grid-cols-[272px_minmax(0,1fr)_60px] md:gap-8 md:py-9"
              >
                <span className="block aspect-[3/2] overflow-hidden bg-neutral-100">
                  <Img src={e.thumb || undefined} alt={e.title} className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink group-hover:underline">{e.title}</span>
                  <span className="mt-2 flex items-center gap-1.5 text-sm text-ink-soft">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                    {eventRange(e)}
                  </span>
                  {e.location && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-soft">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                      {e.location}
                    </span>
                  )}
                  <span className="my-3 block h-1 w-16 rounded bg-brand-light" />
                  <span className="line-clamp-4 block text-sm leading-relaxed text-ink-soft">{e.excerpt} ......</span>
                </span>
                <span aria-hidden className="hidden text-3xl text-ink transition-transform group-hover:translate-x-1 md:block">
                  &#10230;
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Pagination page={page} totalPages={totalPages} basePath="/media/events" />
      </div>
    </>
  );
}

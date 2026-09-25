import type { Metadata } from "next";
import Link from "next/link";
import { fmtDMY, pressItems } from "@/content/media";
import Img from "@/ui/Img";
import MediaBanner from "@/ui/Media/MediaBanner";
import MediaTabs from "@/ui/Media/MediaTabs";

export const metadata: Metadata = {
  title: "Press",
  description: "Press releases and media coverage of Mtandt Group.",
  alternates: { canonical: "/media/press" },
};

export default function Page() {
  return (
    <>
      <MediaBanner />
      <MediaTabs active="press" />
      <div className="default-margin py-8 md:py-10">
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {pressItems.map((p) => (
            <li key={p.slug} className="min-w-0">
              <Link href={`/press/${p.slug}`} className="group block no-underline">
                <span className="block aspect-[7/4] overflow-hidden bg-neutral-100">
                  <Img
                    src={p.image || undefined}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="mt-6 block px-2 text-xs font-semibold uppercase leading-relaxed text-ink group-hover:underline">
                  {p.cardTitle}
                </span>
                <span className="mt-1 block px-2 text-[11px] uppercase text-ink-soft">{fmtDMY(p.date)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

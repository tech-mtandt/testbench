import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPress, pressItems } from "@/content/media";
import Article, { neighbours, pickMore } from "@/ui/Newsroom/Article";
import { cleanHtml, htmlToText, mixedFeed, pressSource, readingMinutes, sortedPress } from "@/ui/Newsroom/data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => pressItems.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPress((await params).slug);
  if (!p) return {};
  return {
    title: { absolute: p.meta.title || p.title },
    description: p.meta.description,
    alternates: { canonical: `/press/${p.slug}` },
    openGraph: { type: "article", images: p.image ? [p.image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const p = getPress((await params).slug);
  if (!p) notFound();
  const list = sortedPress();
  const { prev, next } = neighbours(
    list,
    list.findIndex((x) => x.slug === p.slug),
    (x) => ({ href: `/press/${x.slug}`, title: x.cardTitle || x.title }),
  );
  const feed = await mixedFeed();

  return (
    <Article
      kind="press"
      title={p.title}
      category={pressSource(p)}
      date={p.date}
      minutes={readingMinutes(htmlToText(p.body))}
      lead={p.meta.description && p.meta.description !== p.title ? p.meta.description : null}
      hero={p.image}
      heroAspect="aspect-[2/1]"
      tags={p.tags.filter((t) => !/^magazine$/i.test(t))}
      path={`/press/${p.slug}`}
      more={pickMore(feed, `p-${p.slug}`, "press")}
      prev={prev}
      next={next}
    >
      <div className="prose-mt" dangerouslySetInnerHTML={{ __html: cleanHtml(p.body) }} />
    </Article>
  );
}

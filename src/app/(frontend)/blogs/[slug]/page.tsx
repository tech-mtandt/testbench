import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { blogFallback, blogHero, getBlog, scrapedBlogs } from "@/content/media";
import { lexicalToText } from "@/lib/payload";
import Article, { neighbours, pickMore } from "@/ui/Newsroom/Article";
import { allBlogCards, cleanHtml, htmlToText, mixedFeed, readingMinutes } from "@/ui/Newsroom/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlog((await params).slug);
  if (!post) return {};
  const live = scrapedBlogs[post.slug]?.meta;
  const description = live?.description || post.excerpt || lexicalToText(post.body, 160);
  const image = blogHero(post);
  return {
    title: live?.title ? { absolute: live.title } : post.title,
    description,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: { type: "article", title: post.title, description, publishedTime: post.publishedDate ?? undefined, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) notFound();
  const [cards, feed] = await Promise.all([allBlogCards(), mixedFeed()]);
  const fallback = blogFallback(post);
  const text = fallback ? htmlToText(fallback.body) : lexicalToText(post.body, 200_000);
  const tags = scrapedBlogs[slug]?.tags ?? [];
  const { prev, next } = neighbours(
    cards,
    cards.findIndex((c) => c.slug === slug),
    (c) => ({ href: `/blogs/${c.slug}`, title: c.title }),
  );

  return (
    <Article
      kind="articles"
      title={post.title}
      category={post.category || fallback?.category}
      date={post.publishedDate ?? fallback?.date ?? null}
      minutes={readingMinutes(text)}
      lead={post.excerpt}
      hero={blogHero(post)}
      tags={tags}
      path={`/blogs/${slug}`}
      more={pickMore(feed, `a-${slug}`, "articles")}
      prev={prev}
      next={next}
    >
      {fallback ? (
        <div className="prose-mt [&_img]:mx-auto [&_img]:max-h-[420px] [&_img]:w-auto" dangerouslySetInnerHTML={{ __html: cleanHtml(fallback.body) }} />
      ) : (
        <RichText data={post.body} className="prose-mt [&_img]:mx-auto [&_img]:max-h-[420px] [&_img]:w-auto" />
      )}
    </Article>
  );
}

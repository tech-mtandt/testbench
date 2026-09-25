import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { blogFallback, blogHero, fmtDMY, fmtLong, getBlog, getLatestBlogs, scrapedBlogs } from "@/content/media";
import { lexicalToText } from "@/lib/payload";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import ShareLinks from "@/ui/Media/ShareLinks";
import SideList from "@/ui/Media/SideList";
import Tags from "@/ui/Media/Tags";

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
    openGraph: { type: "article", title: post.title, description, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = await getBlog(slug);
  if (!post) notFound();
  const latest = await getLatestBlogs(slug);
  const hero = blogHero(post);
  const fallback = blogFallback(post);
  const tags = scrapedBlogs[slug]?.tags ?? [];

  return (
    <div className="default-margin pb-12 pt-4">
      <Breadcrumbs items={[{ label: "Media", href: "/media" }, { label: "Blogs", href: "/media/blogs" }, { label: post.title }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <article className="min-w-0">
          <p className="text-xs text-ink-soft">{fmtLong(post.publishedDate)}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-[1.9rem]">{post.title}</h1>
          {hero && <Img src={hero} alt={post.title} loading="eager" className="mt-4 w-full bg-neutral-100" />}
          {fallback ? (
            <div className="prose-legacy mt-6 [&_img]:mx-auto [&_img]:max-h-[420px] [&_img]:w-auto [&_li]:text-ink [&_p]:text-ink" dangerouslySetInnerHTML={{ __html: fallback.body }} />
          ) : (
            <RichText data={post.body} className="prose-legacy mt-6 [&_li]:text-ink [&_p]:text-ink" />
          )}
          <Tags tags={tags} />
          <ShareLinks path={`/blogs/${post.slug}`} />
        </article>
        <SideList
          title="Latest Blogs"
          items={latest.map((b) => ({ href: `/blogs/${b.slug}`, title: b.title, image: b.image, date: fmtDMY(b.date) }))}
        />
      </div>
    </div>
  );
}

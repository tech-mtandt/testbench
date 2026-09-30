import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fmtDMY, fmtLong, getPress, pressItems } from "@/content/media";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import ShareLinks from "@/ui/Media/ShareLinks";
import SideList from "@/ui/Media/SideList";
import Tags from "@/ui/Media/Tags";

type Props = { params: Promise<{ slug: string }> };

// Releases added in the CMS get pages too; refresh every 10 minutes (admin edits also revalidate).
export const revalidate = 600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await pressItems()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPress((await params).slug);
  if (!p) return {};
  const image = p.meta.image || p.image;
  return {
    title: { absolute: p.meta.title || p.title },
    description: p.meta.description,
    alternates: { canonical: `/press/${p.slug}` },
    openGraph: { type: "article", images: image ? [image] : undefined },
  };
}

export default async function Page({ params }: Props) {
  const p = await getPress((await params).slug);
  if (!p) notFound();
  const latest = (await pressItems()).filter((x) => x.slug !== p.slug).slice(0, 7);

  return (
    <div className="default-margin pb-12 pt-4">
      <Breadcrumbs items={[{ label: "Media", href: "/media" }, { label: "Press", href: "/media/press" }, { label: p.title }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <article className="min-w-0">
          <p className="text-xs text-ink-soft">{fmtLong(p.date)}</p>
          <h1 className="mt-1 text-2xl font-semibold md:text-[1.9rem]">{p.title}</h1>
          {p.image && <Img src={p.image} alt={p.title} loading="eager" className="mt-4 w-full" />}
          <div className="prose-legacy mt-6 [&_li]:text-ink [&_p]:text-ink" dangerouslySetInnerHTML={{ __html: p.body }} />
          <Tags tags={p.tags} />
          <ShareLinks path={`/press/${p.slug}`} />
        </article>
        <SideList
          title="Latest Press"
          items={latest.map((x) => ({ href: `/press/${x.slug}`, title: x.title, image: x.image, date: fmtDMY(x.date) }))}
        />
      </div>
    </div>
  );
}

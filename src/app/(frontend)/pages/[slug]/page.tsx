import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/ui/PageChrome";
import legal from "@/content/scraped/legal.json";

type Params = { params: Promise<{ slug: string }> };
type LegalPage = { meta: { title: string; description: string }; title: string; crumb: string; html: string };
const pages = legal as Record<string, LegalPage>;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) return {};
  return { title: p.meta.title, description: p.meta.description, alternates: { canonical: `/pages/${slug}` } };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) notFound();
  return (
    <>
      <div className="default-margin pt-3">
        <Breadcrumbs items={[{ label: "Pages" }, { label: p.crumb }]} />
      </div>
      <div className="default-margin pb-10 pt-12">
        <h1 className="mb-4 text-center text-2xl font-semibold uppercase text-[#444]">{p.title}</h1>
        <div
          className="prose-legacy text-[15px] leading-relaxed text-ink [&_a]:no-underline [&_h5]:mb-2 [&_h5]:mt-4 [&_h5]:text-base [&_h5]:font-semibold [&_h5_u]:underline"
          dangerouslySetInnerHTML={{ __html: p.html }}
        />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import ImageGrid from "@/ui/CustomProduct/ImageGrid";
import { CaseStudyCards, CenterTitle, ClientLogos, TitleBanner } from "@/ui/CustomProduct/Sections";
import { getIndustry, industrySlugs } from "@/content/custom";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = getIndustry(slug);
  if (!d) return {};
  return {
    title: `${d.title} Industry`,
    description: d.heading || undefined,
    alternates: { canonical: `/industries/${slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const d = getIndustry(slug);
  if (!d) notFound();

  return (
    <main>
      <TitleBanner
        title={d.title}
        image={d.banner}
        crumbs={<Breadcrumbs items={[{ label: "Industries", href: "/industries" }, { label: d.title }]} />}
      />

      <section className="bg-surface py-10 md:py-12">
        <div className="default-margin grid gap-8 md:grid-cols-2">
          <div className="min-w-0">
            {d.heading && (
              <h2 className="mb-4 max-w-md text-xl font-bold leading-snug text-ink md:text-2xl">{d.heading}</h2>
            )}
            <div className="prose-legacy text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: d.html }} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            {d.images.map((src) => (
              <div key={src} className="border border-neutral-200 bg-white p-1">
                <Img src={src} alt={d.title} className="aspect-[9/4] w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {d.gallery.length > 0 && (
        <section className="py-10">
          <div className="default-margin">
            <CenterTitle>Gallery</CenterTitle>
            <ImageGrid variant="carousel" images={d.gallery.map((g) => ({ src: g.image, title: g.title }))} />
          </div>
        </section>
      )}

      <CaseStudyCards items={d.caseStudies} />
      <ClientLogos logos={d.clients} />
    </main>
  );
}

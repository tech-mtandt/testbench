import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/ui/PageChrome";
import { DownloadIcon, SocialIcon } from "@/ui/Icons";
import ImageGrid from "@/ui/CustomProduct/ImageGrid";
import { CaseStudyCards, CenterTitle, TitleBanner } from "@/ui/CustomProduct/Sections";
import { caseStudySlugs, getCaseStudy } from "@/content/custom";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = getCaseStudy(slug);
  if (!d) return {};
  return {
    title: d.title,
    description: d.blocks[0]?.html.replace(/<[^>]+>/g, "").slice(0, 160) || undefined,
    alternates: { canonical: `/casestudy/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const d = getCaseStudy(slug);
  if (!d) notFound();

  const url = encodeURIComponent(`https://www.mtandt.com/casestudy/${slug}`);
  const share = [
    { name: "facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, bg: "bg-[#3b5998]" },
    { name: "twitter", href: `https://twitter.com/share?url=${url}&text=mtandt`, bg: "bg-[#1da1f2]" },
    { name: "linkedin", href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=mtandt`, bg: "bg-[#0077b5]" },
  ] as const;

  return (
    <main>
      <TitleBanner title={d.title} image={d.banner} crumbs={<Breadcrumbs items={[{ label: "Case-Study" }]} />} />

      <section className="py-10 md:py-12">
        <div className="default-margin grid gap-10 md:grid-cols-2 md:gap-8">
          <div className="min-w-0 space-y-6">
            {d.blocks.map((b) => (
              <div key={b.title}>
                <h2 className="text-lg font-bold text-ink">{b.title}</h2>
                <div className="prose-legacy text-sm leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: b.html }} />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <h2 className="mb-2 text-lg font-bold text-ink">Project Detail</h2>
            <table className="w-full border-collapse text-sm">
              <tbody>
                {d.details.map(([k, v]) => (
                  <tr key={k}>
                    <td className="w-[35%] border border-neutral-200 bg-surface px-2 py-2.5 font-semibold text-ink-soft">{k}:</td>
                    <td className="border border-neutral-200 px-2 py-2.5 text-ink-soft">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 grid grid-cols-2 text-center">
              {d.download && (
                <div className="border-r border-neutral-200">
                  <h3 className="text-base font-bold text-ink md:text-lg">Download case study</h3>
                  <a
                    href={d.download}
                    download
                    aria-label="Download case study"
                    className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-ink"
                  >
                    <DownloadIcon className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-ink">Share Case Study:</h3>
                <div className="mt-1 flex justify-center gap-1.5">
                  {share.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Share on ${s.name}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${s.bg}`}
                    >
                      <SocialIcon name={s.name} className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {d.gallery.length > 0 && (
        <section className="bg-[#e9ecef] py-10">
          <div className="default-margin">
            <CenterTitle>Gallery</CenterTitle>
            <ImageGrid images={d.gallery.map((src) => ({ src }))} />
          </div>
        </section>
      )}

      <CaseStudyCards items={d.related} title="Case Study" />
    </main>
  );
}

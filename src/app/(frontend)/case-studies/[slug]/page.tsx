import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, Flag, Lightbulb, Trophy, type LucideIcon } from "lucide-react";
import { caseStudySlugs, getCaseStudy } from "@/content/custom";
import { EnquireButton } from "@/ui/Enquiry";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import Gallery from "@/ui/Industries/Gallery";
import { industriesFor, isPlaceholder, legacyAssetExists, relatedCaseStudies } from "@/ui/Industries/model";
import { CaseStudyCard, IndustryIcon } from "@/ui/Industries/parts";
import { plainText, summary } from "@/ui/Services/model";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = getCaseStudy(slug);
  if (!d) return {};
  const first = plainText(d.blocks[0]?.html ?? "");
  return {
    title: `${d.title} — Case study`,
    description: first && !isPlaceholder(first) ? summary(first, 160) : `Case study: ${d.title} — Mtandt Group.`,
    alternates: { canonical: `/case-studies/${slug}` },
  };
}

const stepIcon: [RegExp, LucideIcon][] = [
  [/challenge|problem/i, Flag],
  [/solution|approach/i, Lightbulb],
  [/result|outcome|impact/i, Trophy],
];

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const d = getCaseStudy(slug);
  if (!d) notFound();

  const industries = industriesFor(slug);
  const related = relatedCaseStudies(slug).slice(0, 3);
  // Legacy download links 404 on the live site — only show the button when the file exists.
  const download = legacyAssetExists(d.download) ? d.download : null;
  const [cover, ...rest] = d.gallery;
  const details = d.details.filter(([k, v]) => k && v);

  return (
    <>
      <PageHero
        crumbs={[
          { label: "Industries", href: "/industries" },
          ...(industries[0] ? [{ label: industries[0].title, href: `/industries/${industries[0].slug}` }] : []),
          { label: d.title },
        ]}
        eyebrow={industries.length ? `Case study · ${industries.map((i) => i.title).join(", ")}` : "Case study"}
        title={d.title}
        description={d.blocks[0] ? summary(plainText(d.blocks[0].html), 180) : undefined}
        actions={
          <>
            <EnquireButton subject={`Project like “${d.title}”`} source={`case-study:${slug}`} mode="Other" className={buttonClass("primary")}>
              Discuss a similar project
            </EnquireButton>
            {download && (
              <a href={download} download className={buttonClass("outline")}>
                <Download className="h-4 w-4" /> Download case study
              </a>
            )}
          </>
        }
        image={cover ?? d.banner}
        imageAlt={d.title}
      />

      {/* ------------------------------------------------ story + spec */}
      <Section className="!pt-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
          <ol className="relative min-w-0 space-y-4">
            <span aria-hidden className="absolute top-6 bottom-6 left-[27px] hidden w-px bg-line sm:block" />
            {d.blocks.map((b, i) => {
              const Icon = stepIcon.find(([re]) => re.test(b.title))?.[1] ?? Flag;
              const last = i === d.blocks.length - 1;
              return (
                <Reveal key={b.title} delay={0.05 * i}>
                  <li
                    className={`relative grid gap-5 rounded-[var(--radius-card)] p-6 sm:grid-cols-[56px_minmax(0,1fr)] sm:p-8 ${
                      last ? "bg-graphite text-white" : "border border-line bg-white"
                    }`}
                  >
                    <span
                      className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-full ${last ? "bg-brand text-ink" : "bg-canvas text-ink"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className={`font-mono text-[11px] uppercase tracking-[0.14em] tabular ${last ? "text-white/50" : "text-subtle"}`}>
                        Step {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className={`mt-1 text-2xl tracking-tight ${last ? "text-white" : ""}`}>{b.title}</h2>
                      <div
                        className={`prose-mt mt-4 [&>*:last-child]:mb-0 ${last ? "!text-white/75 [&_b]:!text-white [&_strong]:!text-white" : ""}`}
                        dangerouslySetInnerHTML={{ __html: b.html }}
                      />
                    </div>
                  </li>
                </Reveal>
              );
            })}
          </ol>

          <aside className="min-w-0 lg:sticky lg:top-32 lg:self-start">
            <Reveal delay={0.08} className="card overflow-hidden">
              <p className="border-b border-line px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Project details</p>
              <dl className="divide-y divide-line">
                {details.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_minmax(0,1fr)] gap-4 px-6 py-3.5">
                    <dt className="text-[13px] text-subtle">{k}</dt>
                    <dd className="text-sm font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {industries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 border-t border-line px-6 py-4">
                  {industries.map((ind) => (
                    <Link
                      key={ind.slug}
                      href={`/industries/${ind.slug}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3 text-[13px] font-medium text-ink-2 no-underline transition-colors hover:bg-brand hover:text-ink"
                    >
                      <IndustryIcon name={ind.icon} className="h-3.5 w-3.5" /> {ind.title}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2 border-t border-line bg-canvas/60 p-4">
                <EnquireButton subject={`Project like “${d.title}”`} source={`case-study:${slug}`} mode="Other" className={buttonClass("primary", "md", "w-full")}>
                  Discuss a similar project
                </EnquireButton>
                {download && (
                  <a href={download} download className={buttonClass("outline", "md", "w-full")}>
                    <Download className="h-4 w-4" /> Case study (PDF)
                  </a>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>

      {rest.length > 0 && (
        <Section tone="white">
          <SectionHeader eyebrow="Gallery" title="From the project." description={`${d.gallery.length} photos`} />
          <Gallery images={d.gallery.map((src) => ({ src }))} label={d.title} />
        </Section>
      )}

      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="More case studies"
            title="Related projects."
            action={
              <Link href="/industries" className={buttonClass("outline")}>
                All industries <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <StaggerItem key={c.slug} className="h-full">
                <CaseStudyCard c={c} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
    </>
  );
}


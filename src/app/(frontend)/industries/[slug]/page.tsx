import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getIndustry, industrySlugs } from "@/content/custom";
import { productTiles } from "@/content/nav";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import Gallery from "@/ui/Industries/Gallery";
import { isJunkIndustry, isPlaceholder, listIndustries, liveCaseStudies } from "@/ui/Industries/model";
import { CaseStudyCard, ClientsMarquee, IndustryIcon } from "@/ui/Industries/parts";
import OnPageNav from "@/ui/Services/OnPageNav";
import ServiceEnquiry from "@/ui/Services/ServiceEnquiry";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return industrySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = getIndustry(slug);
  if (!d || isJunkIndustry(slug)) return {};
  return {
    title: `${d.title} Industry`,
    description: isPlaceholder(d.heading)
      ? `Aerial work platforms, scaffolding, material handling, training and rope access for the ${d.title.toLowerCase()} industry — from Mtandt Group.`
      : d.heading,
    alternates: { canonical: `/industries/${slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Params }) {
  const { slug } = await params;
  // Legacy CMS test entry — never linked; send stray traffic to the hub.
  if (isJunkIndustry(slug)) permanentRedirect("/industries");
  const d = getIndustry(slug);
  if (!d) notFound();

  const tile = listIndustries().find((i) => i.slug === slug);
  const cases = liveCaseStudies(d.caseStudies);
  const others = listIndustries().filter((i) => i.slug !== slug);
  const [heroImg, ...sideImgs] = d.images;
  const gallery = d.gallery.map((g) => ({ src: g.image, title: g.title }));

  const nav = [
    { id: "overview", label: "Overview" },
    ...(gallery.length ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(cases.length ? [{ id: "case-studies", label: "Case studies" }] : []),
    { id: "equipment", label: "Equipment" },
    ...(d.clients.length ? [{ id: "clients", label: "Clients" }] : []),
    { id: "enquire", label: "Enquire" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Industries", href: "/industries" }, { label: d.title }]}
        eyebrow="Industry"
        title={d.title}
        description={d.heading || undefined}
        actions={
          <>
            <EnquireButton subject={`${d.title} industry`} source={`industry:${slug}`} mode="Other" className={buttonClass("primary")}>
              Enquire for {d.title}
            </EnquireButton>
            <Link href="/products" className={buttonClass("outline")}>
              Browse equipment <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        }
        aside={
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-line">
            <Img src={heroImg ?? d.banner ?? undefined} alt={d.title} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-ink">
              <IndustryIcon name={tile?.icon ?? null} className="h-5 w-5" />
            </span>
          </div>
        }
      />

      <OnPageNav items={nav} />

      <Section id="overview" className="scroll-mt-40">
        <div className={`grid gap-12 ${sideImgs.length ? "lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16" : ""}`}>
          <Reveal className="min-w-0">
            <p className="eyebrow mb-5">Overview</p>
            <h2 className="display-md max-w-2xl">Mtandt for {d.title.toLowerCase()}.</h2>
            <div className="prose-mt mt-8 max-w-2xl [&>*:first-child]:mt-0" dangerouslySetInnerHTML={{ __html: d.html }} />
          </Reveal>
          {sideImgs.length > 0 && (
            <div className="grid min-w-0 content-start gap-4">
              {sideImgs.map((src, i) => (
                <Reveal key={src} delay={0.06 * (i + 1)} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-line">
                  <Img src={src} alt={d.title} className="absolute inset-0 h-full w-full object-cover" />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Section>

      {gallery.length > 0 && (
        <Section id="gallery" tone="white" className="scroll-mt-40">
          <SectionHeader eyebrow="Gallery" title="On site." description={`${gallery.length} photos from ${d.title.toLowerCase()} projects.`} />
          <Gallery images={gallery} label={`${d.title} gallery`} />
        </Section>
      )}

      {cases.length > 0 && (
        <Section id="case-studies" className="scroll-mt-40">
          <SectionHeader eyebrow="Case studies" title={`${d.title} projects.`} />
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((c) => (
              <StaggerItem key={c.slug} className="h-full">
                <CaseStudyCard c={c} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      <Section id="equipment" tone="dark" className="scroll-mt-40">
        <SectionHeader
          dark
          eyebrow="Equipment"
          title={`Equipment for ${d.title.toLowerCase()} sites.`}
          description="Buy or rent from eight equipment families — delivered, commissioned and serviced by our own teams."
          action={
            <Link href="/products" className={buttonClass("light")}>
              All equipment <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productTiles.map((t) => (
            <StaggerItem key={t.slug} className="h-full">
              <Link
                href={t.href}
                className="group flex h-full items-center gap-4 rounded-[var(--radius-card)] bg-graphite-2 p-4 no-underline ring-1 ring-white/5 transition-colors duration-500 hover:ring-white/20"
              >
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
                  {t.image && (
                    <Img
                      src={t.image}
                      alt=""
                      className={`absolute inset-0 h-full w-full ${t.photo ? "object-cover" : "object-contain p-1.5 mix-blend-multiply"}`}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium leading-snug text-white">{t.title}</span>
                  <span className="font-mono text-[11px] text-white/50 tabular">{t.count} products</span>
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-white/50 transition-all duration-500 group-hover:rotate-45 group-hover:text-brand" />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <ClientsMarquee logos={d.clients} title={`Trusted in ${d.title.toLowerCase()}`} />

      <ServiceEnquiry
        subject={`${d.title} industry`}
        title={`Planning a ${d.title.toLowerCase()} project?`}
        text="Share the site, the height and the timeline — we'll recommend equipment, people and training, and reply within one business day."
        form="industry-enquiry"
        page="Industry"
      />

      <Section tight className="!pt-0">
        <p className="eyebrow mb-5">Other industries</p>
        <ul className="flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link
                href={`/industries/${o.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink-2 no-underline transition-colors hover:border-ink/40 hover:text-ink"
              >
                <IndustryIcon name={o.icon} className="h-4 w-4" /> {o.title}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

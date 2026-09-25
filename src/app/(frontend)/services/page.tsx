import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { listServices } from "@/content/services";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import FallbackImg from "@/ui/Services/FallbackImg";
import ServiceGrid from "@/ui/Services/ServiceGrid";
import { familyIcon } from "@/ui/Services/icons";
import { families, hubData, plainText, summary, toCards, type FamilySlug, type ServiceCardData } from "@/ui/Services/model";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Equipment AMC, operator training, competency certifications, rope access, CESL training, EQUIPR asset management and EAT industrial rope access services from Mtandt Group.",
  alternates: { canonical: "/services" },
};

type Props = { searchParams: Promise<{ family?: string }> };

export default async function ServicesPage({ searchParams }: Props) {
  const { family } = await searchParams;
  const cards = toCards(await listServices());
  const services = cards.filter((c) => c.family && !families.some((f) => f.slug === c.slug));
  const initial = families.some((f) => f.slug === family) ? (family as FamilySlug) : "all";

  // Stats built only from existing copy (hub "why" points + course details).
  const stats = [
    { value: String(families.length), label: "Service families — training, asset care and rope access" },
    { value: String(services.length), label: "Specialist services under one contract" },
    { value: "5,000+", label: "People trained by CESL in the past three years" },
    { value: "3,000+ hrs", label: "Logged by our IRATA Level 3 rope access supervisors" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Services" }]}
        eyebrow="Services"
        title="Services for every stage of work at height."
        description="Certified training, lifecycle management and industrial rope access — delivered by the teams who know the equipment best."
        actions={
          <>
            <EnquireButton subject="Services" source="services" mode="Other" className={buttonClass("primary")}>
              Talk to a specialist
            </EnquireButton>
            <a href="#all-services" className={buttonClass("outline")}>
              Browse all {services.length} services
            </a>
          </>
        }
        aside={<HeroMosaic cards={families.map((f) => ({ slug: f.slug, image: hubData(f.slug).aboutImage?.src ?? null, title: f.title }))} />}
      />

      <section className="border-y border-line bg-white">
        <Stagger className="container-x grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StaggerItem
              key={s.label}
              className={`py-7 sm:py-9 ${i % 2 ? "pl-5 sm:pl-8" : "pr-5 sm:pr-8"} ${i > 0 ? "lg:border-l lg:border-line lg:pl-8" : ""} ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}
            >
              <p className="font-mono text-3xl tracking-tight text-ink tabular sm:text-4xl">{s.value}</p>
              <p className="mt-2 max-w-[16rem] text-[13px] leading-snug text-muted">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Section id="families" className="scroll-mt-28">
        <SectionHeader
          eyebrow="Service families"
          title="Three specialist units. One accountable partner."
          description="Each family is run by its own certified team — CESL for training, EQUIPR for asset management, Evolution Access Technologies for rope access."
        />
        <div className="space-y-4 sm:space-y-6">
          {families.map((f, i) => (
            <FamilyPanel key={f.slug} slug={f.slug} flip={i % 2 === 1} dark={i === 1} cards={cards} />
          ))}
        </div>
      </Section>

      <Section id="all-services" tone="white" className="scroll-mt-28">
        <SectionHeader
          eyebrow="Directory"
          title="Every service, in one place."
          description="Filter by family, then open a service for course details, standards and scope."
        />
        <ServiceGrid services={services} families={families.map((f) => ({ slug: f.slug, title: f.title }))} initial={initial} />
      </Section>

      <Section tight>
        <Reveal className="flex flex-col items-start gap-6 rounded-[var(--radius-panel)] bg-graphite p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="eyebrow mb-4 text-white/60">Not sure where to start?</p>
            <h2 className="display-md text-white">Tell us the job. We&apos;ll scope the service.</h2>
            <p className="mt-4 text-white/65">One enquiry reaches training, maintenance and rope access teams — we reply within one business day.</p>
          </div>
          <EnquireButton subject="Services" source="services:cta" mode="Other" className={buttonClass("primary", "lg")}>
            Start an enquiry
          </EnquireButton>
        </Reveal>
      </Section>
    </>
  );
}

function HeroMosaic({ cards }: { cards: { slug: FamilySlug; image: string | null; title: string }[] }) {
  return (
    <div className="grid aspect-[4/3] grid-cols-2 grid-rows-2 gap-3">
      {cards.map((c, i) => {
        const Icon = familyIcon[c.slug];
        return (
          <Link
            key={c.slug}
            href={`/services/${c.slug}`}
            className={`group relative overflow-hidden rounded-[var(--radius-card)] bg-graphite no-underline ${i === 0 ? "row-span-2" : ""}`}
          >
            {c.image && (
              <Img
                src={c.image}
                alt=""
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <span className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-ink">
              <Icon className="h-4 w-4" />
            </span>
            <span className="absolute inset-x-4 bottom-3 text-sm font-medium text-white sm:text-base">{c.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

function FamilyPanel({ slug, flip, dark, cards }: { slug: FamilySlug; flip: boolean; dark: boolean; cards: ServiceCardData[] }) {
  const f = families.find((x) => x.slug === slug)!;
  const hub = hubData(slug);
  const Icon = familyIcon[slug];
  const members = f.members.map((m) => cards.find((c) => c.slug === m)).filter((c): c is ServiceCardData => !!c);
  return (
    <Reveal>
      <article
        className={`grid overflow-hidden rounded-[var(--radius-panel)] lg:grid-cols-2 ${dark ? "bg-graphite text-white" : "border border-line bg-white"}`}
      >
        <Link
          href={`/services/${slug}`}
          className={`group relative block aspect-[16/10] overflow-hidden no-underline lg:aspect-auto lg:min-h-[520px] ${flip ? "lg:order-2" : ""}`}
        >
          <FallbackImg
            sources={[hub.aboutImage?.src]}
            alt={hub.aboutImage?.alt ?? f.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
          {hub.logo?.src && (
            <span className="glass absolute top-4 left-4 flex h-14 items-center rounded-2xl px-3.5">
              <Img src={hub.logo.src} alt={hub.logo.alt} className="h-9 w-auto object-contain" />
            </span>
          )}
        </Link>
        <div className="flex min-w-0 flex-col p-6 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 items-center justify-center rounded-full ${dark ? "bg-brand text-ink" : "bg-canvas text-ink"}`}>
              <Icon className="h-5 w-5" />
            </span>
            <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "text-white/55" : "text-muted"}`}>
              {f.brand} · {hub.tagline}
            </p>
          </div>
          <h3 className={`mt-6 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl ${dark ? "text-white" : ""}`}>{f.title}</h3>
          <p className={`mt-4 max-w-lg leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>{summary(plainText(hub.aboutHtml), 230)}</p>
          <ul className={`mt-8 grid flex-1 content-start gap-x-6 border-t sm:grid-cols-2 ${dark ? "border-white/10" : "border-line"}`}>
            {members.map((m) => (
              <li key={m.slug} className={`border-b ${dark ? "border-white/10" : "border-line"}`}>
                <Link
                  href={`/services/${m.slug}`}
                  className={`group/l flex min-h-12 items-center justify-between gap-3 py-2 text-sm no-underline transition-colors ${
                    dark ? "text-white/80 hover:text-brand" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {m.title}
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40 transition-transform duration-300 group-hover/l:translate-x-0.5 group-hover/l:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/services/${slug}`} className={buttonClass(dark ? "primary" : "dark")}>
              Explore {f.brand} <ArrowUpRight className="h-4 w-4" />
            </Link>
            {hub.brochure && (
              <a href={hub.brochure} download className={buttonClass(dark ? "ghost" : "outline", "md", dark ? "text-white hover:bg-white/10" : "")}>
                Brochure (PDF)
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

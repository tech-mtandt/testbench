import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, Play } from "lucide-react";
import { RichText } from "@/components/RichText";
import { mediaAlt, mediaUrl, payloadClient } from "@/lib/payload";
import type { About } from "@/payload-types";
import data from "@/content/scraped/about.json";
import home from "@/content/scraped/home.json";
import irData from "@/content/scraped/annual-returns.json";
import { Button } from "@/ui/kit/Button";
import { Breadcrumbs } from "@/ui/kit/PageHero";
import Reveal from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import { AccreditationsAwards, GroupCompanies, PoweringProgress, Principles, WhyMtandt } from "@/ui/About/Sections";
import InvestorRelations from "@/ui/Company/InvestorRelations";
import Journey from "@/ui/Company/Journey";
import People, { type Person } from "@/ui/Company/People";
import SectionNav from "@/ui/Company/SectionNav";
import VideoPoster from "@/ui/Company/VideoPoster";
import { cleanCopy, irDoc, isPlaceholder, youTubeId } from "@/ui/Company/lib";

export const revalidate = 600;

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/about-us" },
};

const livePhoto = new Map([...data.investors, ...data.management].map((m) => [m.name.toLowerCase(), m.image]));

/** DB team rows; rows without a designation override are placeholder/test users and are skipped. */
function dbMembers(entries: About["investors"]): Person[] {
  return (entries ?? [])
    .filter((e) => e.designation && e.user && typeof e.user === "object")
    .map((e) => {
      const u = e.user as Exclude<typeof e.user, number>;
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
      return {
        id: e.id ?? String(u.id),
        name,
        fallbackUrl: livePhoto.get(name.toLowerCase()),
        designation: e.designation || u.jobTitle,
        imageUrl: mediaUrl(u.profilePicture),
        imageAlt: mediaAlt(u.profilePicture),
      };
    });
}

const scrapedMembers = (rows: { name: string; designation: string; image: string | null }[]): Person[] =>
  rows.map((r) => ({ id: r.name, name: r.name, designation: r.designation, imageUrl: r.image }));

/** Prefer the DB list, unless it is less complete than what is live. */
const pick = (db: Person[], live: Person[]) => (db.length >= live.length ? db : live);

async function getAbout(): Promise<About | null> {
  try {
    const payload = await payloadClient();
    return await payload.findGlobal({ slug: "about", depth: 2 });
  } catch (err) {
    console.error("[about-us] failed to load about global", err);
    return null;
  }
}

const sections = [
  { id: "whoweare", label: "Who we are" },
  { id: "group-principle", label: "Principles" },
  { id: "PoweringProgress", label: "Capabilities" },
  { id: "bussiness-unit", label: "Group" },
  { id: "team", label: "Leadership" },
  { id: "WhyMTandT", label: "Why Mtandt" },
  { id: "OurJourney", label: "Journey" },
  { id: "accreditations", label: "Accreditations" },
  { id: "awards", label: "Awards" },
  { id: "investors", label: "Investors" },
];

export default async function Page() {
  const about = await getAbout();
  const videoId = youTubeId(about?.link) ?? youTubeId(data.who.video);
  const investors = pick(dbMembers(about?.investors), scrapedMembers(data.investors));
  const management = pick(dbMembers(about?.management), scrapedMembers(data.management));
  const cards = about?.poweringProgressCards?.length ? about.poweringProgressCards : data.powering.cards;
  const since = new Date().getFullYear() - 1974;

  const units = data.companies.map((c, i) => ({
    title: c.title,
    icon: c.icon,
    brands: (home.brandTabs.find((t) => t.label === c.title) ?? home.brandTabs[i])?.brands ?? [],
  }));

  const milestones = data.journey.items.map((j) => ({
    year: j.year,
    title: cleanCopy(j.title),
    text: isPlaceholder(j.text) ? null : cleanCopy(j.text),
    image: j.image,
  }));

  const companies = irData.tabs.map((t) => ({
    label: t.label,
    groups: t.groups.map((g) => ({ title: g.title, docs: g.docs.map((d) => irDoc(d, g.title)) })),
  }));

  const stats = [
    { value: `${since}`, unit: "yrs", label: "Serving industry since 1974" },
    { value: "25", unit: "", label: "Business units & subsidiaries" },
    { value: "5,000+", unit: "", label: "Customers across SAARC" },
    { value: String(management.length + investors.length), unit: "", label: "Leaders on the team below" },
  ];

  return (
    <>
      {/* ------------------------------------------------ hero / who we are */}
      <header id="whoweare" className="scroll-mt-28 pt-28 sm:pt-32">
        <div className="container-x">
          <Breadcrumbs items={[{ label: "Company" }, { label: "About us" }]} />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-end">
            <Reveal className="min-w-0">
              <p className="eyebrow mb-5">About Mtandt · Since 1974</p>
              <h1 className="display-lg">
                Fifty years of making work{" "}
                <span className="whitespace-nowrap">
                  <span className="relative isolate inline-block">
                    safer
                    <span aria-hidden className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.26em] rounded-sm bg-brand" />
                  </span>
                  ,
                </span>{" "}
                smarter and simpler.
              </h1>
              <p className="lead mt-6 max-w-xl">
                From a Chennai hardware store to South Asia&apos;s access, lifting and safety group — manufacturing, sales, rentals,
                training and services under one roof.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#OurJourney" variant="dark" icon={<ArrowRight className="h-4 w-4" />}>
                  Our journey
                </Button>
                <Button href="#investors" variant="outline" icon={<Download className="h-4 w-4" />}>
                  Investor relations
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="min-w-0">
              {videoId ? (
                <VideoPoster id={videoId} title="Mtandt Group — corporate film" caption="Mtandt Group in 3 minutes" />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-[var(--radius-panel)] bg-graphite text-white/50">
                  <Play className="h-8 w-8" />
                </div>
              )}
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mt-4 grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white lg:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`p-5 sm:p-6 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                <p className="font-mono text-3xl tracking-tight tabular sm:text-4xl">
                  {s.value}
                  {s.unit && <span className="ml-1 text-lg text-muted">{s.unit}</span>}
                </p>
                <p className="mt-1 text-[13px] text-muted">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </header>

      <div className="mt-10 sm:mt-14">
        <SectionNav sections={sections} label="About Mtandt" />
      </div>

      <Section tight>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-4">{about?.title || data.who.title}</p>
            <h2 className="display-md">The partner you can count on.</h2>
          </Reveal>
          <Reveal delay={0.05}>
            {about?.content ? (
              <RichText
                data={about.content}
                className="prose-mt text-base sm:text-[17px] [&_p:first-child]:text-lg [&_p:first-child]:text-ink [&_p:has(>br:only-child)]:hidden [&_p:empty]:hidden"
              />
            ) : (
              <div
                className="prose-mt text-base sm:text-[17px] [&_p:first-child]:text-lg [&_p:first-child]:text-ink"
                dangerouslySetInnerHTML={{ __html: data.who.html }}
              />
            )}
          </Reveal>
        </div>
      </Section>

      <Principles title={data.principlesTitle} items={data.principles} />

      <PoweringProgress title={data.powering.title} tagline={about?.poweringProgressTagline || data.powering.tagline} cards={cards} />

      <GroupCompanies title={data.companiesTitle} units={units} />

      {/* ------------------------------------------------ leadership */}
      <Section id="team" tone="white" className="scroll-mt-28">
        <SectionHeader eyebrow="Leadership" title="The people behind the promise." description="A family-founded group, run by professional management since 2006." />
        <div className="space-y-12">
          <div>
            <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
              <h3 className="text-lg">Board & investors</h3>
              <p className="font-mono text-[11px] text-subtle">{investors.length} people</p>
            </div>
            <People people={investors} size="lg" />
          </div>
          <div>
            <div className="mb-5 flex items-baseline justify-between border-b border-line pb-3">
              <h3 className="text-lg">Management</h3>
              <p className="font-mono text-[11px] text-subtle">{management.length} people</p>
            </div>
            <People people={management} />
          </div>
        </div>
      </Section>

      <WhyMtandt title={data.why.title} points={data.why.points} image={data.why.image} />

      {/* ------------------------------------------------ journey */}
      <section id="OurJourney" className="scroll-mt-28 py-16 sm:py-24">
        <div className="container-x">
          <SectionHeader
            eyebrow={data.journey.title}
            title={`${milestones[0]?.year}–${milestones[milestones.length - 1]?.year}: from one store to one group.`}
            description={data.journey.intro}
          />
        </div>
        <Journey items={milestones} />
      </section>

      <AccreditationsAwards acc={data.accreditations} awards={data.awards} />

      {/* ------------------------------------------------ investors */}
      <Section id="investors" className="scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="lg:sticky lg:top-40 lg:self-start">
            <p className="eyebrow mb-4">Investor relations</p>
            <h2 className="display-md">Annual returns & CSR disclosures.</h2>
            <p className="mt-4 leading-relaxed text-muted">
              Statutory filings for Mtandt Limited and Mtandt Rentals Limited, including Form MGT-7 annual returns and Corporate Social
              Responsibility reports. All documents open as PDF.
            </p>
            <Button href="/contact-us" variant="outline" className="mt-6" icon={<ArrowRight className="h-4 w-4" />}>
              Investor enquiries
            </Button>
          </div>
          <div className="min-w-0">
            <InvestorRelations companies={companies} />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ closing */}
      <Section tight>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { eyebrow: "Careers", title: "Build what matters, Dil Se.", href: "/career", cta: "See open roles", dark: true },
            { eyebrow: "Partners", title: "Grow with us as a dealer or vendor.", href: "/partners", cta: "Partner programs", dark: false },
          ].map((c) => (
            <Reveal key={c.href}>
              <Link
                href={c.href}
                className={`group flex h-full flex-col justify-between gap-10 rounded-[var(--radius-panel)] p-8 no-underline transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 sm:p-10 ${
                  c.dark ? "bg-graphite text-white" : "border border-line bg-white"
                }`}
              >
                <div>
                  <p className={`font-mono text-[11px] tracking-[0.14em] uppercase ${c.dark ? "text-white/50" : "text-subtle"}`}>{c.eyebrow}</p>
                  <h3 className={`mt-3 text-3xl tracking-[-0.03em] sm:text-4xl ${c.dark ? "text-white" : ""}`}>{c.title}</h3>
                </div>
                <span className="inline-flex items-center gap-3 text-sm font-medium">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-500 group-hover:-rotate-45 ${c.dark ? "bg-brand text-ink" : "bg-ink text-white"}`}>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  {c.cta}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Download, FileCheck2 } from "lucide-react";
import { RichText } from "@/components/RichText";
import type { getService } from "@/content/services";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import FallbackImg from "./FallbackImg";
import OnPageNav, { type NavItem } from "./OnPageNav";
import ServiceCard from "./ServiceCard";
import ServiceEnquiry from "./ServiceEnquiry";
import { factIcon, familyIcon, featureIcon } from "./icons";
import {
  families,
  familyOf,
  isHub,
  parseServiceBody,
  parseSupported,
  plainText,
  summary,
  titleCase,
  type Family,
  type Feature,
  type ServiceCardData,
} from "./model";

type Loaded = NonNullable<Awaited<ReturnType<typeof getService>>>;

const brandName: Record<string, string> = { cesl: "CESL", equipr: "Equipr", eat: "Evolution Access" };

/**
 * One adaptive template for both service kinds:
 *  - detail pages (a single service) and
 *  - hub pages (CESL / EQUIPR / EAT family landing pages).
 * Sections render only when their data exists.
 */
export default function ServicePage({
  s,
  title,
  excerpt,
  cards,
}: {
  s: Loaded;
  title: string;
  excerpt: string | null;
  /** All listed services (for related + hub member cards) */
  cards: ServiceCardData[];
}) {
  const data = s.scraped;
  const family = familyOf(s.slug);
  const hub = data.kind === "hub" ? data : null;
  const detail = data.kind === "detail" ? data : null;

  const parsed = detail && !s.body ? parseServiceBody(detail.html, detail.features) : null;
  // DB rich text wins over the scrape (see getService); legacy features still apply.
  const features: Feature[] = parsed?.features ?? (detail ? parseServiceBody("", detail.features).features : []);
  const brochure = data.brochure;

  const siblings = family ? cards.filter((c) => c.family === family.slug && c.slug !== s.slug && !isHub(c.slug)) : [];
  const otherFamilies = families.filter((f) => f.slug !== family?.slug);

  const crumbs = [
    { label: "Services", href: "/services" },
    ...(family && !hub ? [{ label: family.title, href: `/services/${family.slug}` }] : []),
    { label: hub ? family?.title ?? title : title },
  ];

  const heroImage = hub ? [hub.aboutImage?.src] : [detail?.image, ...s.banners];
  const panorama = detail ? s.banners : [];
  const description = hub ? hub.services.intro || summary(plainText(hub.aboutHtml), 180) : excerpt;

  const nav: NavItem[] = [
    { id: "overview", label: "Overview" },
    ...(features.length > 1 ? [{ id: "highlights", label: "Highlights" }] : []),
    ...(hub ? [{ id: "services", label: "Services" }] : []),
    ...(hub?.why.items.length ? [{ id: "why", label: "Why us" }] : []),
    ...(hub?.supported ? [{ id: "supported", label: "Supported equipment" }] : []),
    ...(siblings.length || hub ? [{ id: "related", label: hub ? "More services" : "Related" }] : []),
    { id: "enquire", label: "Enquire" },
  ];

  const enquire = (size: "sm" | "md" = "md", children = "Enquire about this service") => (
    <EnquireButton subject={title} source={`service:${s.slug}`} mode="Other" className={buttonClass("primary", size)}>
      {children}
    </EnquireButton>
  );

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow={family ? (hub ? `${family.brand} · ${hub.tagline}` : `${family.title} · ${family.brand}`) : "Service"}
        title={hub ? family?.title ?? title : title}
        description={description || undefined}
        actions={
          <>
            {enquire()}
            {brochure && (
              <a href={brochure} download className={buttonClass("outline")}>
                <Download className="h-4 w-4" /> Download brochure
              </a>
            )}
          </>
        }
        aside={
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-line">
            <FallbackImg sources={heroImage} alt={title} loading="eager" className="absolute inset-0 h-full w-full object-cover" />
            {hub?.logo?.src && (
              <span className="glass absolute bottom-4 left-4 flex h-16 items-center rounded-2xl px-4">
                <Img src={hub.logo.src} alt={hub.logo.alt} className="h-10 w-auto object-contain" />
              </span>
            )}
          </div>
        }
      />

      {panorama.length > 0 && (
        <div className="container-x -mt-4 mb-10 sm:mb-14">
          <Reveal className="relative aspect-[3/1] overflow-hidden rounded-[var(--radius-panel)] bg-line sm:aspect-[5/1] lg:aspect-[1349/210]">
            <FallbackImg sources={panorama} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </Reveal>
        </div>
      )}

      <OnPageNav items={nav} action={enquire("sm", "Enquire")} />

      {/* ------------------------------------------------ overview */}
      <Section id="overview" className="scroll-mt-40">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <Reveal className="min-w-0">
            <p className="eyebrow mb-5">Overview</p>
            <h2 className="display-md max-w-2xl">
              {hub ? hub.aboutTitle : detail?.subheading ? titleCase(detail.subheading) : `About ${title}`}
            </h2>
            <div className="mt-8 max-w-2xl">
              {s.body ? (
                <RichText data={s.body as never} className="prose-mt" />
              ) : (
                <div
                  className="prose-mt [&>*:first-child]:mt-0"
                  dangerouslySetInnerHTML={{ __html: hub ? hub.aboutHtml : parsed?.html ?? "" }}
                />
              )}
            </div>

            {features.length === 1 && <FeatureCallout f={features[0]} />}
            {features.length > 1 && <FeatureGrid features={features} />}

            {parsed && parsed.benefits.length > 0 && (
              <div className="mt-10 max-w-2xl rounded-[var(--radius-card)] border border-line bg-white p-6 sm:p-8">
                <p className="eyebrow mb-5">Benefits</p>
                <ul className="space-y-3">
                  {parsed.benefits.map((b, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-2">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-ink">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </span>
                      <span className="prose-mt [&_a]:font-medium" dangerouslySetInnerHTML={{ __html: b }} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detail?.cta && (detail.cta.text || detail.cta.href) && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {detail.cta.text && <p className="font-medium">{detail.cta.text}</p>}
                {detail.cta.href && (
                  <Link href={detail.cta.href} className={buttonClass("dark")}>
                    {detail.cta.label || "Learn more"}
                  </Link>
                )}
              </div>
            )}
          </Reveal>

          <aside className="min-w-0 lg:sticky lg:top-44 lg:self-start">
            <Reveal delay={0.08} className="card overflow-hidden">
              {parsed && parsed.facts.length > 0 ? (
                <>
                  <p className="border-b border-line px-6 py-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                    At a glance
                  </p>
                  <dl className="divide-y divide-line">
                    {parsed.facts.map((f) => {
                      const Icon = factIcon(f.label);
                      return (
                        <div key={f.label} className="flex gap-4 px-6 py-4">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                          <div className="min-w-0">
                            <dt className="text-[12px] text-subtle">{f.label}</dt>
                            <dd className="mt-0.5 text-sm leading-snug text-ink">{f.value}</dd>
                          </div>
                        </div>
                      );
                    })}
                  </dl>
                </>
              ) : family ? (
                <FamilyCard family={family} current={s.slug} cards={cards} hub={!!hub} />
              ) : null}

              {parsed && parsed.standards.length > 0 && (
                <div className="border-t border-line px-6 py-5">
                  <p className="mb-3 flex items-center gap-2 text-[12px] text-subtle">
                    <FileCheck2 className="h-4 w-4 text-ink" /> Standards followed
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {parsed.standards.map((st) => (
                      <li key={st} className="rounded-full bg-canvas px-3 py-1.5 font-mono text-[11px] text-ink-2">
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2 border-t border-line bg-canvas/60 p-4">
                {enquire("md", "Request a quote")}
                {brochure && (
                  <a href={brochure} download className={buttonClass("outline", "md", "w-full")}>
                    <Download className="h-4 w-4" /> Brochure (PDF)
                  </a>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </Section>

      {/* ------------------------------------------------ hub: services */}
      {hub && family && <HubServices hub={hub} family={family} cards={cards} />}

      {/* ------------------------------------------------ hub: why choose */}
      {hub && hub.why.items.length > 0 && (
        <Section id="why" tone="dark" className="scroll-mt-40">
          <SectionHeader
            dark
            eyebrow={`Why ${brandName[s.slug] ?? family?.brand ?? ""}`}
            title={whyTitle(hub.why.title, s.slug)}
            description={hub.why.intro && hub.why.intro !== hub.services.intro ? hub.why.intro : undefined}
          />
          <Stagger className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-white/10 sm:grid-cols-2 lg:grid-cols-4 [&:has(>:nth-child(5))]:lg:grid-cols-5">
            {hub.why.items.map((w, i) => (
              <StaggerItem key={i} className="flex h-full flex-col bg-graphite-2 p-7">
                <p className="font-mono text-xs text-brand tabular">{String(i + 1).padStart(2, "0")}</p>
                {w.title && <h3 className="mt-8 text-lg text-white">{w.title}</h3>}
                <p className={`${w.title ? "mt-2" : "mt-8"} text-sm leading-relaxed text-white/65`}>{w.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      {/* ------------------------------------------------ hub: supported equipment */}
      {hub?.supported && (
        <Section id="supported" className="scroll-mt-40">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-panel)] bg-line">
              {hub.supported.image?.src && (
                <Img src={hub.supported.image.src} alt={hub.supported.image.alt} className="absolute inset-0 h-full w-full object-cover" />
              )}
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <p className="eyebrow mb-5">Coverage</p>
              <h2 className="display-md">{hub.supported.title}</h2>
              {hub.supported.intro && <p className="lead mt-5">{hub.supported.intro}</p>}
              <dl className="mt-8 divide-y divide-line border-y border-line">
                {parseSupported(hub.supported.html).map((row) => (
                  <div key={row.type} className="grid gap-3 py-4 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-6">
                    <dt className="text-sm font-medium text-ink">{row.type}</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {row.brands.map((b) => (
                        <span key={b} className="rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink-2">
                          {b}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Section>
      )}

      {/* ------------------------------------------------ related */}
      {!hub && siblings.length > 0 && family && (
        <Section id="related" tone="white" className="scroll-mt-40">
          <SectionHeader
            eyebrow={family.title}
            title={`More from ${family.brand}.`}
            action={
              <Link href={`/services/${family.slug}`} className={buttonClass("outline")}>
                {family.title} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {siblings.slice(0, 4).map((c) => (
              <StaggerItem key={c.slug} className="h-full">
                <ServiceCard s={c} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}
      {hub && (
        <Section id="related" tone="white" className="scroll-mt-40">
          <SectionHeader
            eyebrow="Service families"
            title="Explore our other services."
            action={
              <Link href="/services" className={buttonClass("outline")}>
                All services <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            {otherFamilies.map((f) => (
              <FamilyLink key={f.slug} family={f} />
            ))}
          </div>
        </Section>
      )}

      <ServiceEnquiry subject={title} />
    </>
  );
}

function whyTitle(raw: string, slug: string) {
  const mine = brandName[slug] ?? "";
  const others = Object.entries(brandName).filter(([k]) => k !== slug).map(([, v]) => v.toLowerCase());
  if (!raw || others.some((o) => raw.toLowerCase().includes(o))) return `Why choose ${mine}?`;
  return raw;
}

function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div id="highlights" className="mt-12 max-w-3xl scroll-mt-40">
      <p className="eyebrow mb-5">Highlights</p>
      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((f, i) => {
          const Icon = featureIcon(f.icon, f.title);
          return (
            <StaggerItem key={i} className={`h-full ${features.length % 2 === 1 && i === features.length - 1 ? "sm:col-span-2" : ""}`}>
              <div className="group flex h-full gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 transition-[border-color,box-shadow] duration-500 hover:border-line-strong hover:shadow-[var(--shadow-lift)] sm:p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base leading-snug">{f.title}</h3>
                  {f.html && (
                    <div className="prose-mt mt-1.5 text-sm !leading-relaxed text-muted [&_p]:mb-0" dangerouslySetInnerHTML={{ __html: f.html }} />
                  )}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}

function FeatureCallout({ f }: { f: Feature }) {
  const Icon = featureIcon(f.icon, f.title);
  return (
    <div className="mt-10 flex max-w-2xl items-start gap-5 rounded-[var(--radius-card)] bg-graphite p-6 text-white sm:p-7">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-ink">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">Highlight</p>
        <p className="mt-1.5 text-lg leading-snug text-white">{f.html ? plainText(f.html) : f.title}</p>
      </div>
    </div>
  );
}

function FamilyCard({ family, current, cards, hub }: { family: Family; current: string; cards: ServiceCardData[]; hub: boolean }) {
  const Icon = familyIcon[family.slug];
  const members = family.members.map((m) => cards.find((c) => c.slug === m)).filter((c): c is ServiceCardData => !!c);
  return (
    <div>
      <Link href={`/services/${family.slug}`} className="group flex items-center gap-4 border-b border-line px-6 py-5 no-underline">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-ink">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{hub ? "Family" : "Part of"}</span>
          <span className="block font-medium text-ink">
            {family.title} · {family.brand}
          </span>
        </span>
        {!hub && <ArrowUpRight className="h-4 w-4 text-muted transition-transform duration-500 group-hover:rotate-45" />}
      </Link>
      <ul className="px-3 py-2">
        {members.map((m) => {
          const on = m.slug === current;
          return (
            <li key={m.slug}>
              <Link
                href={`/services/${m.slug}`}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-sm no-underline transition-colors ${
                  on ? "bg-canvas font-medium text-ink" : "text-ink-2 hover:bg-canvas hover:text-ink"
                }`}
              >
                {m.title}
                {on ? <span className="h-1.5 w-1.5 rounded-full bg-brand" /> : <ArrowRight className="h-3.5 w-3.5 opacity-40" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function HubServices({
  hub,
  family,
  cards,
}: {
  hub: Extract<Loaded["scraped"], { kind: "hub" }>;
  family: Family;
  cards: ServiceCardData[];
}) {
  const listed = hub.services.items.map((it) => it.href?.split("/").pop() ?? "");
  const extra = family.members.filter((m) => !listed.includes(m)).map((m) => cards.find((c) => c.slug === m)).filter((c): c is ServiceCardData => !!c);
  return (
    <Section id="services" className="scroll-mt-40">
      <SectionHeader
        eyebrow={`${family.brand} services`}
        title={hub.services.title === "Our Services" ? `What ${brandName[family.slug]} delivers.` : hub.services.title}
        description={`${family.members.length} services in ${family.title.toLowerCase()}.`}
      />
      <Stagger className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${hub.services.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        {hub.services.items.map((it, i) => {
          const card = cards.find((c) => c.slug === listed[i]);
          const inner = (
            <>
              <div className="relative aspect-[4/3] overflow-hidden bg-line">
                <FallbackImg
                  sources={card?.images ?? []}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
                {it.image && (
                  <span className="glass absolute bottom-3 left-3 flex h-14 w-14 items-center justify-center rounded-2xl p-1.5">
                    <Img src={it.image} alt="" className="h-full w-full object-contain" />
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="font-mono text-xs text-subtle tabular">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-lg leading-snug">{it.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{it.text}</p>
                {it.href && (
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                )}
              </div>
            </>
          );
          return (
            <StaggerItem key={it.title} className="h-full">
              {it.href ? (
                <Link href={it.href} className="card card-hover group flex h-full flex-col overflow-hidden no-underline">
                  {inner}
                </Link>
              ) : (
                <div className="card group flex h-full flex-col overflow-hidden">{inner}</div>
              )}
            </StaggerItem>
          );
        })}
      </Stagger>
      {extra.length > 0 && (
        <Reveal className="mt-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 sm:flex-row sm:items-center sm:p-6">
          <p className="shrink-0 text-sm font-medium text-ink">Also in {family.title}</p>
          <ul className="flex flex-wrap gap-2">
            {extra.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/services/${c.slug}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-canvas px-4 text-[13px] font-medium text-ink-2 no-underline transition-colors hover:border-ink/40 hover:text-ink"
                >
                  {c.title} <ArrowUpRight className="h-3.5 w-3.5 opacity-50" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Section>
  );
}

/** Compact family panel used for cross-links (hub → other hubs). */
export function FamilyLink({ family }: { family: Family }) {
  const Icon = familyIcon[family.slug];
  return (
    <Link
      href={`/services/${family.slug}`}
      className="group flex items-center gap-5 rounded-[var(--radius-card)] border border-line bg-canvas p-6 no-underline transition-colors duration-500 hover:border-line-strong sm:p-7"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-colors duration-500 group-hover:bg-brand">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-subtle">{family.brand}</span>
        <span className="mt-0.5 block text-lg font-medium text-ink">{family.title}</span>
        <span className="block text-sm text-muted">{family.members.length} services</span>
      </span>
      <ArrowUpRight className="h-5 w-5 text-ink transition-transform duration-500 group-hover:rotate-45" />
    </Link>
  );
}

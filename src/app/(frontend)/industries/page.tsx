import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { catalog } from "@/content/catalog";
import { getIndustry } from "@/content/custom";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import { featuredCaseStudies, listIndustries } from "@/ui/Industries/model";
import { CaseStudyCard, IndustryIcon } from "@/ui/Industries/parts";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "Industries served by Mtandt Group: railway, aviation, automobile, energy, hotels & buildings, FMCG/warehouses and events.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  const industries = listIndustries();
  const cases = featuredCaseStudies();

  return (
    <>
      <PageHero
        crumbs={[{ label: "Industries" }]}
        eyebrow="Industries"
        title="Access, lifting and safety for every kind of site."
        description={`From rail corridors and hangars to plants, warehouses and live events — ${industries.length} industries run on Mtandt equipment, people and training.`}
        actions={
          <>
            <Link href="/products" className={buttonClass("primary")}>
              Browse equipment <ArrowRight className="h-4 w-4" />
            </Link>
            <EnquireButton subject="Industry solutions" source="industries" mode="Other" className={buttonClass("outline")}>
              Talk to a specialist
            </EnquireButton>
          </>
        }
      />

      <Section tight className="!pt-0">
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {industries.map((ind, i) => {
            const d = getIndustry(ind.slug)!;
            const big = i === 0;
            return (
              <StaggerItem key={ind.slug} className={big ? "col-span-2" : ""}>
                <Link
                  href={`/industries/${ind.slug}`}
                  className="group relative flex h-[220px] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] bg-graphite p-4 no-underline sm:h-[340px] sm:p-6"
                >
                  <Img
                    src={d.images[0] ?? ind.banner ?? undefined}
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/10" />
                  <div className="relative flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-ink">
                      <IndustryIcon name={ind.icon} className="h-5 w-5" />
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors duration-500 group-hover:bg-brand group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                    </span>
                  </div>
                  <div className="relative">
                    <p className="font-mono text-[11px] text-white/60 tabular">
                      {String(i + 1).padStart(2, "0")}
                      {ind.caseStudies > 0 && ` · ${ind.caseStudies} case ${ind.caseStudies === 1 ? "study" : "studies"}`}
                    </p>
                    <h2 className={`mt-1 text-white ${big ? "text-3xl sm:text-4xl" : "text-lg sm:text-2xl"} font-semibold leading-tight tracking-[-0.035em]`}>{ind.title}</h2>
                    {ind.text && <p className={`mt-2 line-clamp-2 max-w-md text-sm text-white/70 ${big ? "" : "hidden sm:block"}`}>{ind.text}</p>}
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Section>

      {cases.length > 0 && (
        <Section tone="white">
          <SectionHeader
            eyebrow="Case studies"
            title="Proof from the field."
            description="How teams across industries solved access, lifting and safety challenges with Mtandt."
          />
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cases.slice(0, 6).map((c) => (
              <StaggerItem key={c.slug} className="h-full">
                <CaseStudyCard c={c} tag={c.industry} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      )}

      <Section tight>
        <Reveal className="grid gap-8 overflow-hidden rounded-[var(--radius-panel)] bg-graphite p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow mb-4 text-white/60">Equipment</p>
            <h2 className="display-md text-white">Don&apos;t see your industry?</h2>
            <p className="mt-4 max-w-lg text-white/65">
              {catalog.length} machines and systems — to buy or rent — plus training and maintenance. Tell us about the site and we&apos;ll match the equipment.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/products" className={buttonClass("primary", "lg")}>
              Browse equipment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/services" className={buttonClass("ghost", "lg", "text-white hover:bg-white/10")}>
              Services
            </Link>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

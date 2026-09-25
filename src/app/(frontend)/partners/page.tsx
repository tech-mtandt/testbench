import type { Metadata } from "next";
import { partnerForms, partnerMeta } from "@/content/partner-forms";
import PageHero from "@/ui/kit/PageHero";
import { Section } from "@/ui/kit/Section";
import PartnerHub from "@/ui/Partner/PartnerHub";
import { asProgramType as asType, programKey, programTypes as types, type Program, type ProgramType } from "@/ui/Partner/programs";
import { stripTags } from "@/ui/Company/lib";

type Props = { searchParams: Promise<{ type?: string }> };


export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { type } = await searchParams;
  const m = type ? partnerMeta[programKey[asType(type)]] : null;
  return {
    title: m?.title ?? "Partner with Mtandt — dealer, vendor & customer credit | Mtandt Group",
    description: m?.description ?? "Become a Mtandt dealer, register as a vendor, or apply for a customer credit account.",
    alternates: { canonical: "/partners" },
  };
}

/** Dealer benefits live as a <ol> of "<b>Title:</b> text" items in the scraped intro. */
function points(html: string) {
  return (html.match(/<li>[\s\S]*?<\/li>/g) ?? []).map((li) => {
    const t = stripTags(li);
    const i = t.indexOf(":");
    return i > 0 && i < 60 ? { title: t.slice(0, i).trim(), text: t.slice(i + 1).trim() } : { title: t, text: "" };
  });
}

const copy: Record<ProgramType, { name: string; pitch: string }> = {
  dealer: { name: "Dealer program", pitch: "Sell and support Mtandt equipment, training and services in your region." },
  vendor: { name: "Vendor registration", pitch: "Supply products or services to Mtandt Group's factories, fleet and projects." },
  customer: { name: "Customer credit", pitch: "Open a credit account for rentals and purchases across Mtandt businesses." },
};

export default async function Page({ searchParams }: Props) {
  const { type } = await searchParams;
  const programs: Program[] = types.map((t) => {
    const page = partnerForms[programKey[t]];
    const intro = stripTags(page.intro);
    return {
      type: t,
      ...copy[t],
      page,
      points: points(page.intro).length
        ? points(page.intro)
        : intro && !/coming soon/i.test(intro)
          ? [{ title: intro.replace(/\s*Enquire now to know the benefits\.?/i, ""), text: "" }]
          : [],
    };
  });

  return (
    <>
      <PageHero
        crumbs={[{ label: "Company", href: "/about-us" }, { label: "Partners" }]}
        eyebrow="Partner programs"
        title="Grow with India's work-at-height specialist."
        description="Three ways to work with Mtandt Group. Pick a program — the application opens below in a few short steps."
      />
      <Section tight className="!pt-0">
        <PartnerHub programs={programs} initial={asType(type)} />
      </Section>
    </>
  );
}

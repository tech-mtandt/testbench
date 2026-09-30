import data from "@/content/scraped/about.json";
import type { About } from "@/payload-types";
import { fileUrl, html } from "@/cms/read";

export type Principle = { prefix: string; title: string; html: string; icon: string | null; art: string | null };
export type Company = { title: string; href: string; icon: string | null };
export type Why = { title: string; points: string[]; image: string | null; bg: string | null; bullet: string | null };
export type JourneyData = {
  title: string;
  intro: string;
  bg: string | null;
  road: string | null;
  items: { year: string; title: string; text: string; image: string | null }[];
};
export type Accreditations = { title: string; text: string; logos: string[]; bg: string | null };
export type Awards = { title: string; text: string; images: string[] };

const urls = (list: unknown[] | null | undefined) =>
  (list ?? []).map((m) => fileUrl(m as never)).filter((u): u is string => Boolean(u));

/**
 * The About page sections below "Who we are", from the `about` global. Each section falls
 * back to about.json while it is empty in the CMS (titles fall back field by field).
 */
export function aboutSections(about: About | null) {
  const a = about ?? ({} as Partial<About>);
  const why: Why =
    a.why?.title || a.why?.points?.length
      ? {
          title: a.why.title ?? "",
          points: (a.why.points ?? []).map((p) => p.value),
          image: fileUrl(a.why.image),
          bg: fileUrl(a.why.background),
          bullet: fileUrl(a.why.bullet),
        }
      : data.why;
  const journey: JourneyData =
    a.journey?.title || a.journey?.items?.length
      ? {
          title: a.journey.title ?? "",
          intro: a.journey.intro ?? "",
          bg: fileUrl(a.journey.background),
          road: fileUrl(a.journey.road),
          items: (a.journey.items ?? []).map((j) => ({
            year: j.year,
            title: j.title ?? "",
            text: j.text ?? "",
            image: fileUrl(j.image),
          })),
        }
      : data.journey;
  const accreditations: Accreditations =
    a.accreditations?.title || a.accreditations?.logos?.length
      ? {
          title: a.accreditations.title ?? "",
          text: a.accreditations.text ?? "",
          logos: urls(a.accreditations.logos),
          bg: fileUrl(a.accreditations.background),
        }
      : data.accreditations;
  const awards: Awards =
    a.awards?.title || a.awards?.images?.length
      ? { title: a.awards.title ?? "", text: a.awards.text ?? "", images: urls(a.awards.images) }
      : data.awards;

  return {
    principlesTitle: a.principlesTitle || data.principlesTitle,
    principles: a.principles?.length
      ? a.principles.map<Principle>((p) => ({
          prefix: p.prefix ?? "",
          title: p.title,
          html: html(p.content),
          icon: p.icon || null,
          art: p.art || null,
        }))
      : (data.principles as Principle[]),
    poweringTitle: a.poweringProgressTitle || data.powering.title,
    companiesTitle: a.companiesTitle || data.companiesTitle,
    // groupOfCompanies predates the import and holds rows the site never showed; trust it
    // only once the import has run (it sets companiesTitle).
    companies: a.companiesTitle && a.groupOfCompanies?.length
      ? a.groupOfCompanies.map<Company>((c) => ({ title: c.title, href: c.link || "/", icon: fileUrl(c.icon) }))
      : (data.companies as Company[]),
    why,
    journey,
    accreditations,
    awards,
  };
}

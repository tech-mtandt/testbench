/**
 * View-model helpers for industries + case studies (over src/content/custom.ts).
 * NOTE: the legacy industry and case-study copy is lorem-ipsum placeholder; layouts
 * here are built so real copy drops in without changes.
 */
import fs from "node:fs";
import path from "node:path";
import { caseStudySlugs, getCaseStudy, getIndustry, industryIndex, industrySlugs, type CaseStudyCard } from "@/content/custom";

/** CMS test entries on the legacy site that should never be listed. */
const JUNK_INDUSTRIES = new Set(["industries-name"]);

const slugFromHref = (href: string | null | undefined) => href?.split("/").filter(Boolean).pop() ?? "";

export const caseStudyHref = (slug: string) => `/case-studies/${slug}`;

export type IndustryTile = { slug: string; title: string; text: string; icon: string | null; banner: string | null; caseStudies: number };

export function listIndustries(): IndustryTile[] {
  return industryIndex
    .map((c) => ({ c, slug: slugFromHref(c.href) }))
    .filter(({ slug }) => !JUNK_INDUSTRIES.has(slug) && industrySlugs.includes(slug))
    .map(({ c, slug }) => {
      const d = getIndustry(slug)!;
      return { slug, title: c.title, text: c.text, icon: c.icon, banner: d.banner, caseStudies: liveCaseStudies(d.caseStudies).length };
    });
}

export const isJunkIndustry = (slug: string) => JUNK_INDUSTRIES.has(slug);

export type CaseStudyTile = { slug: string; title: string; text: string; image: string | null; href: string };

/** Keep only cards whose case study exists (legacy "related" lists point at deleted entries). */
export function liveCaseStudies(cards: CaseStudyCard[]): CaseStudyTile[] {
  const seen = new Set<string>();
  return cards.flatMap((c) => {
    const slug = slugFromHref(c.href);
    if (!slug || seen.has(slug) || !caseStudySlugs.includes(slug)) return [];
    seen.add(slug);
    return [{ slug, title: c.title, text: c.text, image: c.image, href: caseStudyHref(slug) }];
  });
}

/** Every case study referenced by a listed industry, in industry order, deduped. */
export function featuredCaseStudies(): (CaseStudyTile & { industry: string })[] {
  const seen = new Set<string>();
  return listIndustries().flatMap((ind) =>
    liveCaseStudies(getIndustry(ind.slug)!.caseStudies)
      .filter((c) => !seen.has(c.slug) && seen.add(c.slug))
      .map((c) => ({ ...c, industry: ind.title })),
  );
}

/** Industries that list this case study (for crumbs / tags). */
export function industriesFor(caseSlug: string) {
  return listIndustries().filter((ind) => getIndustry(ind.slug)!.caseStudies.some((c) => slugFromHref(c.href) === caseSlug));
}

/** Case studies related to this one: its legacy "related" list, then same-industry peers. */
export function relatedCaseStudies(caseSlug: string): CaseStudyTile[] {
  const d = getCaseStudy(caseSlug);
  if (!d) return [];
  const peers = industriesFor(caseSlug).flatMap((ind) => getIndustry(ind.slug)!.caseStudies);
  return liveCaseStudies([...d.related, ...peers]).filter((c) => c.slug !== caseSlug);
}

/**
 * Whether a scraped /legacy asset actually exists (the legacy site 404s on some).
 * Checks the local mirror in public/legacy; when no mirror is present (a deploy that
 * serves /legacy from storage) it falls back to the scrape's known-missing list.
 */
export function legacyAssetExists(url: string | null | undefined): boolean {
  if (!url) return false;
  if (!url.startsWith("/legacy/")) return true;
  const root = path.join(process.cwd(), "public", "legacy");
  const rel = decodeURIComponent(url.slice("/legacy/".length));
  try {
    if (fs.existsSync(root)) return fs.existsSync(path.join(root, rel));
  } catch {
    /* fall through */
  }
  return !KNOWN_MISSING.has(rel);
}

/** From public/legacy/_missing.txt at scrape time — lets deploys without the mirror hide them too. */
const KNOWN_MISSING = new Set(["imageFile/newfile331653282729.pdf"]);

/** Lorem-ipsum detector so placeholder copy can be visually de-emphasised / skipped in metadata. */
export const isPlaceholder = (text: string | null | undefined) => !text || /lorem ipsum|dummy text|leadonance/i.test(text);

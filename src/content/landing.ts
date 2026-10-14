import { subcategoryHref } from "@/content/urls";

/**
 * Campaign copy for range hubs (/<category>/<subcategory>) that run as ad landing pages.
 * Ranges listed here also get the lead popup and an always-on brochure button; every other
 * range gets a generic hub built from its catalogue data.
 */
export type LandingConfig = {
  category: string;
  subcategory: string;
  /** Plural range name used in headings and breadcrumbs. */
  label: string;
  /** Matches an option in `productInterestOptions`. */
  product: string;
  headline: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  points: { title: string; text: string }[];
};

const configs: LandingConfig[] = [
  {
    category: "aerial-work-platform",
    subcategory: "boom-lift",
    label: "Boom Lifts",
    product: "Boom Lift",
    headline: "Boom Lifts for Sale & Rent",
    intro:
      "Articulated and telescopic boom lifts, electric and diesel, reaching up to 42 m. Buy new or rent for your project, with delivery, operator training and service support across India.",
    metaTitle: "Boom Lifts for Sale & Rent | Articulated & Telescopic | Mtandt",
    metaDescription:
      "Buy or rent articulated and telescopic boom lifts from Mtandt. Electric and diesel models up to 42 m working height, with delivery, training and service support.",
    points: [
      { title: "Up to 42 m reach", text: "Telescopic and articulated booms for high, hard-to-reach work with outreach over obstacles." },
      { title: "Buy or rent", text: "Flexible purchase and short- or long-term rental options to fit your project and budget." },
      { title: "Electric & diesel", text: "Quiet, zero-emission units for indoor work and rough-terrain diesel models for outdoor sites." },
      { title: "Trained & supported", text: "Operator training, certification and on-site service from our team." },
    ],
  },
  {
    category: "aerial-work-platform",
    subcategory: "scissor-lift",
    label: "Scissor Lifts",
    product: "Scissor Lift",
    headline: "Scissor Lifts for Sale & Rent",
    intro:
      "Electric and rough-terrain scissor lifts with large platforms for people, tools and materials. Buy new or rent for your project, with delivery, operator training and service support across India.",
    metaTitle: "Scissor Lifts for Sale & Rent | Electric & Rough Terrain | Mtandt",
    metaDescription:
      "Buy or rent electric and rough-terrain scissor lifts from Mtandt. Compact, stable work platforms for maintenance, construction and warehousing, with training and service support.",
    points: [
      { title: "Large, stable platform", text: "Room for multiple workers, tools and materials, with extension decks on most models." },
      { title: "Buy or rent", text: "Flexible purchase and short- or long-term rental options to fit your project and budget." },
      { title: "Indoor & outdoor", text: "Narrow, non-marking electric units for indoors and rough-terrain models for site work." },
      { title: "Trained & supported", text: "Operator training, certification and on-site service from our team." },
    ],
  },
];

export const landingConfig = (category: string, subcategory: string) =>
  configs.find((c) => c.category === category && c.subcategory === subcategory);

/** Old campaign URLs -> the range hubs that replaced them. */
export const oldLandingPaths: Record<string, string> = {
  "/boom-lifts": subcategoryHref("aerial-work-platform", "boom-lift"),
  "/scissor-lifts": subcategoryHref("aerial-work-platform", "scissor-lift"),
};

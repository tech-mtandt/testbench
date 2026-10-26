import categoriesJson from "@/content/scraped/product-categories.json";
import { categoryHref, subcategoryHref } from "@/content/urls";

/**
 * Campaign copy for range hubs (/<category>/<subcategory>) that run as ad landing pages.
 * Ranges listed here also get the lead popup and an always-on brochure button; every other
 * range gets a generic hub built from its catalogue data. The headline, intro, points and SEO
 * text here are defaults: admin > Landing pages overrides them (src/content/landingPages.ts).
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
  /** Range-specific highlights (shown in the hero's fact strip; keep them short). */
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
      {
        title: "Up to 42 m reach",
        text: "Telescopic and articulated booms for high, hard-to-reach work with outreach over obstacles.",
      },
      {
        title: "Articulated & telescopic",
        text: "Up-and-over reach around obstacles, or straight-line reach for height.",
      },
      {
        title: "Electric & diesel",
        text: "Quiet, zero-emission units for indoor work and rough-terrain diesel models for outdoor sites.",
      },
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
    metaTitle:
      "Scissor Lifts for Sale & Rent | Electric & Rough Terrain | Mtandt",
    metaDescription:
      "Buy or rent electric and rough-terrain scissor lifts from Mtandt. Compact, stable work platforms for maintenance, construction and warehousing, with training and service support.",
    points: [
      {
        title: "Large, stable platform",
        text: "Room for multiple workers, tools and materials, with extension decks on most models.",
      },
      {
        title: "Indoor & outdoor",
        text: "Narrow, non-marking electric units for indoors and rough-terrain models for site work.",
      },
      {
        title: "Electric & rough terrain",
        text: "Battery-powered units for clean sites and rough-terrain models for construction.",
      },
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

/**
 * One cut of a hero video: a short, muted, looping MP4 (10–15 s, H.264, no audio) and its
 * first frame as `poster` (shown while loading and to visitors who prefer reduced motion).
 * `width` and `height` are the video's pixel size: the banner takes that shape, so the
 * whole frame shows instead of being cropped to fit.
 */
export type HeroVideo = {
  src: string;
  poster: string;
  width: number;
  height: number;
};

/**
 * Hero media for landing pages, keyed by category slug ("aerial-work-platform") or
 * "category/subcategory" ("aerial-work-platform/boom-lift"). A range shows only its own
 * video (another range's machine would be the wrong one). `wide` is shown on landscape screens (laptops, desktops):
 * 1920×800 (2.4:1), under ~6 MB. `tall` is shown on portrait screens (phones): 1080×1920
 * (9:16), under ~4 MB. These are the defaults for pages without an entry in admin > Landing pages,
 * where editors set the videos now.
 */
export type HeroMedia = { wide?: HeroVideo; tall?: HeroVideo };

const file = (name: string) => `/api/media/file/${encodeURIComponent(name)}`;
const wide = (video: string, poster: string): HeroVideo => ({ src: file(video), poster: file(poster), width: 1920, height: 800 });
const tall = (video: string, poster: string): HeroVideo => ({ src: file(video), poster: file(poster), width: 1080, height: 1920 });

const boomLiftFilm: HeroMedia = {
  wide: wide("24.WEBSITE VIDEO ANIMATION - DESKTOP SIZE.mp4", "hero-boom-lift-wide.jpg"),
  tall: tall("25.WEBSITE VIDEO ANIMATION - MOBILE SIZE.mp4", "hero-boom-lift-tall.jpg"),
};

const heroMedia: Record<string, HeroMedia> = {
  // The aerial work platforms page leads with the boom lift film.
  "aerial-work-platform": boomLiftFilm,
  "aerial-work-platform/boom-lift": boomLiftFilm,
  "aerial-work-platform/scissor-lift": {
    wide: wide("24.WEBSITE VIDEO ANIMATION - DESKTOP SIZE -SCISSOR LIFT.mp4", "hero-scissor-lift-wide.jpg"),
    tall: tall("25.WEBSITE VIDEO ANIMATION - MOBILE SIZE - SCISSOR LIFT.mp4", "hero-scissor-lift-tall.jpg"),
  },
};

export const landingMedia = (category: string, subcategory?: string): HeroMedia =>
  heroMedia[subcategory ? `${category}/${subcategory}` : category] ?? {};

/**
 * Catalogue (admin > Catalogues, matched by title) for a category's landing pages when none
 * is named after the page's own range, e.g. the boom lift page offers the MEWP brochure.
 */
const categoryBrochures: Record<string, string> = {
  "aerial-work-platform": "Mobile Elevated Work Platforms",
  "material-handling-equipment": "Material Handling Equipment",
  mlit: "Mobile Light Tower",
};

/** The first catalogue with a PDF whose title names one of `names`, else the category's brochure. */
export function findBrochure<T extends { title: string; documentUrl?: string | null }>(catalogues: T[], category: string, names: string[]) {
  const norm = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z]/g, "");
  const named = (name?: string) => (name ? catalogues.find((x) => x.documentUrl && norm(x.title).includes(norm(name))) : undefined);
  return names.map(named).find(Boolean) ?? named(categoryBrochures[category]) ?? null;
}

/** One-line category pitch for the hero (the long CMS intro stays in the About section). */
const categoryTaglines: Record<string, string> = {
  "aerial-work-platform":
    "Vertical, scissor, boom and spider lifts to buy or rent, for safe work at any height.",
  "material-handling-equipment":
    "Duct lifters, order pickers and knuckle boom cranes to lift, place and pick with ease.",
  "aluminium-scaffold":
    "Light, strong aluminium scaffolding that goes up fast and keeps crews safe.",
  mlit: "Mobile light towers and battery power stations for bright, quiet, round-the-clock sites.",
  "temporary-road-mats":
    "Ground protection mats that keep heavy equipment moving on soft or sensitive ground.",
  "fall-protection-lifeline-systems":
    "Engineered lifelines, ladders, barriers and walkways that keep people safe at height.",
  "web-systems-international":
    "Safety nets and deck systems that catch falls and dropped objects on site.",
  "tools-and-supplies":
    "PPE, tools and site supplies to keep every crew equipped and safe.",
};


/** Brand facts for category heroes. */
export const brandFacts = [
  "Since 1974",
  "Buy or rent",
  "Operator training",
  "Service & AMC",
];

/**
 * The pages admin > Landing pages can change: every category page and range page on this site
 * (not the sections moved to the brand websites). `key` is the category slug, or
 * "category/subcategory" for a range, as in `heroMedia`.
 */
type CategoryJson = { slug: string; title: string; subcategories?: { slug: string; name: string }[] };
const own = (path: string) => path.startsWith("/");
export const landingPages = (categoriesJson.categories as CategoryJson[]).flatMap((c) =>
  own(categoryHref(c.slug))
    ? [
        { key: c.slug, label: c.title, path: categoryHref(c.slug) },
        ...(c.subcategories ?? [])
          .map((s) => ({
            key: `${c.slug}/${s.slug}`,
            label: `${c.title} › ${landingConfig(c.slug, s.slug)?.label ?? s.name}`,
            path: subcategoryHref(c.slug, s.slug),
          }))
          .filter((p) => own(p.path)),
      ]
    : [],
);

export const landingPath = (key: unknown) => landingPages.find((p) => p.key === key)?.path ?? null;

/** What a landing page shows today without CMS edits: the defaults the CMS fields fall back to. */
export function landingDefaults(key: string) {
  const [category, subcategory] = key.split("/");
  const config = subcategory ? landingConfig(category, subcategory) : undefined;
  return {
    headline: config?.headline ?? null,
    intro: config?.intro ?? (subcategory ? null : (categoryTaglines[category] ?? null)),
    facts: config ? config.points.map((p) => p.title) : null,
    metaTitle: config?.metaTitle ?? null,
    metaDescription: config?.metaDescription ?? null,
    media: landingMedia(category, subcategory),
  };
}

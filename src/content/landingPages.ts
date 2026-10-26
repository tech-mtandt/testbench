import { cached, fileUrl, markCmsFailure, previewing, str } from "@/cms/read";
import { type HeroMedia, type HeroVideo, landingDefaults } from "@/content/landing";
import { payloadClient } from "@/lib/payload";
import type { LandingPage, Media } from "@/payload-types";

/**
 * Banner and text of a category or range landing page: admin > Landing pages when the page has
 * an entry there, else what src/content/landing.ts sets. Empty text fields fall back field by
 * field. The banner follows the entry when there is one, so removing its video removes it from
 * the page.
 */
export type LandingContent = {
  headline: string | null;
  intro: string | null;
  facts: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  media: HeroMedia;
};

async function read(draft: boolean): Promise<LandingPage[]> {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({
      collection: "landing-pages",
      depth: 1,
      limit: 0,
      pagination: false,
      // Visitors get published entries; a preview gets the latest drafts.
      ...(draft ? { draft: true } : { where: { _status: { equals: "published" } } }),
    });
    return docs;
  } catch (err) {
    console.error('[cms] collection "landing-pages" read failed', err);
    markCmsFailure();
    return [];
  }
}

const published = cached(() => read(false), "cms:landing-pages");

const media = (m: number | Media | null | undefined) => (m && typeof m === "object" ? m : null);

/** One cut of the banner: the video, with its poster's size as the banner's shape. */
function cut(video: LandingPage["wideVideo"], poster: LandingPage["widePoster"], width: number, height: number): HeroVideo | undefined {
  const src = fileUrl(media(video));
  if (!src) return undefined;
  const p = media(poster);
  return { src, poster: fileUrl(p) ?? "", width: p?.width ?? width, height: p?.height ?? height };
}

export async function getLanding(key: string): Promise<LandingContent> {
  const defaults = landingDefaults(key);
  const docs = (await previewing()) ? await read(true) : await published();
  const doc = docs.find((d) => d.page === key);
  if (!doc) return defaults;
  const facts = (doc.facts ?? []).map((f) => f.text.trim()).filter(Boolean);
  return {
    headline: str(doc.headline) ?? defaults.headline,
    intro: str(doc.intro) ?? defaults.intro,
    facts: facts.length ? facts : defaults.facts,
    metaTitle: str(doc.metaTitle) ?? defaults.metaTitle,
    metaDescription: str(doc.metaDescription) ?? defaults.metaDescription,
    media: {
      wide: cut(doc.wideVideo, doc.widePoster, 1920, 800),
      tall: cut(doc.tallVideo, doc.tallPoster, 1080, 1920),
    },
  };
}

import { brandFacts, landingDefaults, landingPages } from "../../../content/landing";
import type { LandingPage } from "../../../payload-types";
import type { ImportTask } from "../types";

/**
 * Fills admin > Landing pages with what the category and range pages show today (from
 * src/content/landing.ts): banner videos and posters (matched in Media by file name), headline,
 * intro, the fact strip and SEO text, published. Pages with nothing of their own (most ranges)
 * are left out; editors add them when needed. Existing entries are kept unless "overwrite".
 */
export const landingPagesTask: ImportTask = {
  key: "landing-pages",
  label: "Landing pages: banner videos and text as shown today",
  async run({ payload, overwrite, log }) {
    const mediaId = async (url: string | undefined) => {
      const name = url?.match(/\/api\/media\/file\/([^?#]+)/)?.[1];
      if (!name) return null;
      const filename = decodeURIComponent(name);
      const { docs } = await payload.find({ collection: "media", where: { filename: { equals: filename } }, limit: 1, depth: 0 });
      if (!docs[0]) log(`! ${filename} is not in Media`);
      return docs[0]?.id ?? null;
    };

    for (const page of landingPages) {
      const d = landingDefaults(page.key);
      const range = page.key.includes("/");
      if (range && !d.headline && !d.intro && !d.facts && !d.media.wide && !d.media.tall) continue;
      const existing = (await payload.find({ collection: "landing-pages", where: { page: { equals: page.key } }, limit: 1, depth: 0 })).docs[0];
      if (existing && !overwrite) {
        log(`  kept ${page.label} (already set up)`);
        continue;
      }
      const data = {
        page: page.key as LandingPage["page"],
        // Category pages show the category's name (empty headline) and the standard facts.
        headline: d.headline,
        intro: d.intro,
        facts: (d.facts ?? (range ? [] : brandFacts)).map((text) => ({ text })),
        metaTitle: d.metaTitle,
        metaDescription: d.metaDescription,
        wideVideo: await mediaId(d.media.wide?.src),
        widePoster: await mediaId(d.media.wide?.poster),
        tallVideo: await mediaId(d.media.tall?.src),
        tallPoster: await mediaId(d.media.tall?.poster),
        _status: "published" as const,
      };
      if (existing) await payload.update({ collection: "landing-pages", id: existing.id, data, draft: false });
      else await payload.create({ collection: "landing-pages", data, draft: false });
      log(`  ${existing ? "updated" : "added"} ${page.label}`);
    }
    return null;
  },
};

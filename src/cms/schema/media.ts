import { MediaPages } from "../../globals/MediaPages";

import type { Area } from "./types";

// blogs/events/press/gallery collections are registered directly in payload.config;
// blogs already has the SEO tab there.
export const mediaArea: Area = {
  collections: [],
  globals: [MediaPages],
  seo: {
    collections: ["events", "press"],
    globals: ["media-pages"],
    url: ({ collectionSlug, globalSlug, doc }) => {
      if (collectionSlug === "events") return `/event/${doc?.slug ?? ""}`;
      if (collectionSlug === "press") return `/press/${doc?.slug ?? ""}`;
      if (globalSlug === "media-pages") return "/media";
      return undefined;
    },
  },
};

import type { Area } from "./types";

// The `home` global itself (src/globals/Home.ts) is registered directly in payload.config.
export const homeArea: Area = {
  collections: [],
  globals: [],
  seo: {
    collections: [],
    globals: ["home"],
    url: ({ globalSlug }) => (globalSlug === "home" ? "/" : undefined),
  },
};

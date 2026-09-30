import type { CollectionConfig, GlobalConfig } from "payload";

/** One area of the site's CMS schema. Registered in ./index.ts and wired into payload.config. */
export type Area = {
  collections?: CollectionConfig[];
  globals?: GlobalConfig[];
  /** Slugs that get the SEO tab (meta title/description/image). `url` gives the public
   * path (e.g. "/industries/marine") for the SEO preview; return undefined if not yours. */
  seo?: {
    collections?: string[];
    globals?: string[];
    url?: (args: { collectionSlug?: string; globalSlug?: string; doc: any }) => string | undefined;
  };
};

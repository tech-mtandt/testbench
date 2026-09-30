import { LegalPages } from "../../collections/LegalPages";
import { AnnualReturnsPage } from "../../globals/AnnualReturnsPage";
import { CataloguesPage } from "../../globals/CataloguesPage";
import { ServicesPage } from "../../globals/ServicesPage";
import type { Area } from "./types";

// `services`, `catalogues` and `partnership` are registered in payload.config (existing
// collections); this area adds fields to them and the page globals around them.
export const pagesArea: Area = {
  collections: [LegalPages],
  globals: [ServicesPage, CataloguesPage, AnnualReturnsPage],
  seo: {
    // "services" already has the SEO tab (payload.config).
    collections: ["partnership", "legal-pages"],
    globals: ["services-page", "catalogues-page", "annual-returns-page"],
    url: ({ collectionSlug, globalSlug, doc }) => {
      if (collectionSlug === "services") return `/services/${doc?.slug ?? ""}`;
      if (collectionSlug === "partnership") return `/${doc?.slug ?? ""}`;
      if (collectionSlug === "legal-pages") return `/pages/${doc?.slug ?? ""}`;
      if (globalSlug === "services-page") return "/services";
      if (globalSlug === "catalogues-page") return "/catalogues";
      if (globalSlug === "annual-returns-page") return "/annual-returns";
      return undefined;
    },
  },
};

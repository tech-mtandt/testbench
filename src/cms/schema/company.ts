import { CaseStudies } from "../../collections/CaseStudies";
import { Industries } from "../../collections/Industries";
import { CareerPage } from "../../globals/CareerPage";
import { ContactPage } from "../../globals/ContactPage";
import { IndustriesPage } from "../../globals/IndustriesPage";
import type { Area } from "./types";

/**
 * About, Careers, Industries, Case studies, Contact. The `about` and `contact` globals and
 * the `careers` collection are registered directly in payload.config (they predate areas).
 */
export const companyArea: Area = {
  collections: [Industries, CaseStudies],
  globals: [CareerPage, IndustriesPage, ContactPage],
  seo: {
    collections: ["industries", "case-studies"],
    globals: ["career-page", "industries-page", "contact-page"],
    url: ({ collectionSlug, globalSlug, doc }) => {
      if (collectionSlug === "industries") return `/industries/${doc?.slug ?? ""}`;
      if (collectionSlug === "case-studies") return `/casestudy/${doc?.slug ?? ""}`;
      if (globalSlug === "career-page") return "/career";
      if (globalSlug === "industries-page") return "/industries";
      if (globalSlug === "contact-page") return "/contact-us";
      return undefined;
    },
  },
};

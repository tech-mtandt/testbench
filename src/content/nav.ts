/**
 * Information architecture for the 2030 redesign. Legacy URLs redirect into these via
 * redirect-only page.tsx files under their old route folders. Contact details / socials stay in site.ts.
 */
import { catalogCategories, categoryCount, categoryHref, categoryImage, categoryShort, itemsInCategory } from "@/content/catalog";

export type MenuLink = { label: string; href: string; description?: string };
export type MenuGroup = { title: string; href?: string; links: MenuLink[] };
export type TopItem =
  | { label: string; href: string }
  | { label: string; href: string; panel: "products" | "services" | "company" };

export const topNav: TopItem[] = [
  { label: "Equipment", href: "/products", panel: "products" },
  { label: "Services", href: "/services", panel: "services" },
  { label: "Industries", href: "/industries" },
  { label: "Media", href: "/media" },
  { label: "Company", href: "/about-us", panel: "company" },
];

export const productTiles = catalogCategories.map((c) => ({
  slug: c.slug,
  title: categoryShort[c.slug] ?? c.title,
  href: categoryHref(c.slug),
  image: categoryImage(c.slug),
  count: categoryCount(c.slug),
  /** systems categories only have site photography (not product cut-outs) */
  photo: itemsInCategory(c.slug)[0]?.kind === "system",
  subs: c.subcategories.map((s) => ({ label: s.name, href: categoryHref(c.slug, { sub: s.slug }) })),
}));

export const servicesMenu: MenuGroup[] = [
  {
    title: "Training & Certification",
    href: "/services/cesl",
    links: [
      { label: "Work at Height Training", href: "/services/work-at-height-training" },
      { label: "MEWP Operator Training", href: "/services/mewp-operator-training" },
      { label: "GWO Basic Safety Training", href: "/services/gwo-basic-safety-training" },
      { label: "Equipment Operator Training", href: "/services/equipment-operator-training" },
      { label: "Industrial Safety Training", href: "/services/industrial-safety-training" },
    ],
  },
  {
    title: "Equipment Management",
    href: "/services/equipr",
    links: [
      { label: "Annual Maintenance (AMC)", href: "/services/amc" },
      { label: "Maintenance Services", href: "/services/maintenance-services" },
      { label: "Repair Services", href: "/services/repair-services" },
      { label: "Yard Services", href: "/services/yard-services" },
      { label: "Telematics & Remote Monitoring", href: "/services/remote-monitoring-system-telematics" },
      { label: "Equipment Manpower", href: "/services/equipment-manpower" },
    ],
  },
  {
    title: "Rope Access",
    href: "/services/eat",
    links: [
      { label: "Rope Access Operations", href: "/services/rope-access-operations-and-services" },
      { label: "Offshore & Onshore", href: "/services/offshore-and-onshore-solutions" },
      { label: "Inspection & Survey", href: "/services/inspection-and-survey" },
      { label: "Rope Access Training", href: "/services/rope-access-training" },
    ],
  },
];

export const companyMenu: MenuGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About Mtandt", href: "/about-us", description: "Five decades of access & safety" },
      { label: "Careers", href: "/career", description: "Open roles across India" },
      { label: "Investor relations", href: "/about-us#investors", description: "Annual returns & CSR" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { label: "Contact", href: "/contact-us", description: "Offices, phone, email" },
      { label: "Become a partner", href: "/partners", description: "Dealer, vendor & credit applications" },
      { label: "Catalogues", href: "/catalogues", description: "Brochures & spec sheets" },
    ],
  },
];

export const footerNav: MenuGroup[] = [
  {
    title: "Equipment",
    links: [
      ...productTiles.slice(0, 6).map((t) => ({ label: t.title, href: t.href })),
      { label: "Rent equipment", href: "/products?mode=rent" },
      { label: "Compare", href: "/products/compare" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Training & Certification", href: "/services/cesl" },
      { label: "Equipment Management", href: "/services/equipr" },
      { label: "Rope Access", href: "/services/eat" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about-us" },
      { label: "Industries", href: "/industries" },
      { label: "Media & events", href: "/media" },
      { label: "Careers", href: "/career" },
      { label: "Partners", href: "/partners" },
      { label: "Catalogues", href: "/catalogues" },
      { label: "Investor relations", href: "/about-us#investors" },
    ],
  },
];

export const legalNav: MenuLink[] = [
  { label: "Privacy", href: "/pages/privacy-policy" },
  { label: "Terms", href: "/pages/term-conditions" },
];

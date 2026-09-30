/**
 * Hardcoded page meta (the legacy meta were placeholders). Dependency-free so the CMS
 * importer can copy it into the SEO fields.
 */

export type PartnerKey = "customers" | "dealer" | "vendors";

/** Live meta titles are CMS placeholders ("Dealer Meta Title"); use readable ones instead. */
export const partnerMeta: Record<PartnerKey, { title: string; description: string; crumb: string }> = {
  customers: {
    title: "Customer Credit Application Form | Mtandt Group",
    description: "Apply for a customer credit account with Mtandt Group.",
    crumb: "Customers",
  },
  dealer: {
    title: "Become a Dealer | Mtandt Group",
    description: "Register as a Mtandt dealer and grow your business with India's leading work-at-height equipment provider.",
    crumb: "Dealer",
  },
  vendors: {
    title: "Vendor Registration | Mtandt Group",
    description: "Register as a vendor to supply products and services to Mtandt Group.",
    crumb: "Vendors",
  },
};

/** The /services listing (the scraped listing meta is lorem ipsum). */
export const servicesMeta = {
  title: "Services | Mtandt Group",
  description:
    "Equipment AMC, operator training, competency certifications, rope access, CESL training, EQUIPR asset management and EAT industrial rope access services from Mtandt Group.",
};

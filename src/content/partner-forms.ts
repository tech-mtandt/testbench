import type { FieldDef } from "@/ui/Forms/LeadForm";
import data from "@/content/scraped/partner-forms.json";

/** LeadForm field + layout hints mirrored from the live Bootstrap grid (span out of 12). */
export type PartnerField = Omit<FieldDef, "type"> & {
  type?: FieldDef["type"] | "radio";
  span?: number;
  hint?: string;
  showIf?: { field: string; value: string };
};
export type PartnerSection = { title: string | null; level?: number; fields: PartnerField[] };
export type PartnerFormPage = {
  meta: { title: string; description: string };
  banner: string | null;
  heading: string;
  intro: string;
  formTitle: string;
  sections: PartnerSection[];
};

export type PartnerKey = "customers" | "dealer" | "vendors";

/** Field sets for the three partner application forms, extracted from the live HTML forms. */
export const partnerForms = data as Record<PartnerKey, PartnerFormPage>;

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

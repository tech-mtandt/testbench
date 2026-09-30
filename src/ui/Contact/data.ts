import contact from "@/content/scraped/contact.json";
import type { ContactPage } from "@/payload-types";
import type { FieldDef } from "@/ui/Forms/LeadForm";
import { cached, fileUrl, readGlobal } from "@/cms/read";
import type { Region } from "./Offices";

export type ContactData = {
  title: string;
  banner: string | null;
  heading: string;
  subheading: string;
  share: { title: string; text: string; button: string; bg: string | null; formTitle: string; fields: FieldDef[] };
  regions: Region[];
  seo: { title: string | null; description: string | null; image: string | null } | null;
};

const scraped: ContactData = {
  title: "Contact Us",
  banner: contact.banner,
  heading: contact.heading,
  subheading: contact.subheading,
  share: { ...contact.share, fields: contact.share.fields as FieldDef[] },
  regions: contact.regions,
  seo: null,
};

/** Contact page: the `contact-page` global, or contact.json until it is saved. */
export const getContact = cached(async (): Promise<ContactData> => {
  const g = await readGlobal<ContactPage>("contact-page");
  if (!g) return scraped;
  const s = g.share;
  return {
    title: g.title,
    banner: fileUrl(g.banner),
    heading: g.heading ?? "",
    subheading: g.subheading ?? "",
    share: {
      title: s?.title ?? "",
      text: s?.text ?? "",
      button: s?.button ?? "",
      bg: fileUrl(s?.background),
      formTitle: s?.formTitle ?? "",
      fields: (s?.fields ?? []).map((f) => ({
        name: f.name,
        label: f.label,
        required: Boolean(f.required),
        // Plain text fields carry no type in the original definitions.
        ...(f.type && f.type !== "text" ? { type: f.type } : {}),
        ...(f.type === "select" ? { options: f.options ?? [] } : {}),
      })),
    },
    regions: (g.regions ?? []).map((r) => ({
      name: r.name,
      cities: (r.cities ?? []).map((c) => ({
        name: c.name,
        offices: (c.offices ?? []).map((o) => ({
          company: o.company ?? "",
          label: o.label,
          address: o.address ?? "",
          phones: o.phones ?? [],
          emails: o.emails ?? [],
          map: o.map || null,
        })),
      })),
    })),
    seo: g.meta ? { title: g.meta.title || null, description: g.meta.description || null, image: fileUrl(g.meta.image) } : null,
  };
}, "contact-page");

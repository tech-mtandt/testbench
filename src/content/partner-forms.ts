import type { FieldDef } from "@/ui/Forms/LeadForm";
import type { Partnership } from "@/payload-types";
import { cached, fileUrl, html, readAll, str } from "@/cms/read";
import data from "@/content/scraped/partner-forms.json";
import { partnerMeta, type PartnerKey } from "@/content/pages-meta";

export { partnerMeta, type PartnerKey };

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

/** Field sets for the three partner application forms, extracted from the live HTML forms. */
export const partnerForms = data as Record<PartnerKey, PartnerFormPage>;

export const partnerKeys = Object.keys(partnerMeta) as PartnerKey[];

type Field = NonNullable<NonNullable<Partnership["sections"]>[number]["fields"]>[number];

function toField(f: Field): PartnerField {
  const out: PartnerField = { name: f.name, label: f.label, required: Boolean(f.required), span: Number(f.span ?? 12) };
  if (f.inputType && f.inputType !== "text") out.type = f.inputType;
  if (f.options?.length) out.options = f.options;
  if (str(f.accept)) out.accept = f.accept!;
  if (str(f.hint)) out.hint = f.hint!;
  if (str(f.showIf?.field)) out.showIf = { field: f.showIf!.field!, value: f.showIf?.value ?? "" };
  return out;
}

/**
 * A partner form page: the `partnership` doc with this slug, or the scraped form with the
 * readable `partnerMeta` before import. `meta.absolute` marks an admin SEO title (used verbatim).
 */
export const getPartnerPage = cached(async (key: PartnerKey) => {
  const doc = (await readAll<Partnership>("partnership", { depth: 1, where: { slug: { equals: key } } }))?.[0];
  const m = partnerMeta[key];
  if (!doc) {
    return {
      crumb: m.crumb,
      page: partnerForms[key],
      meta: { title: m.title, absolute: false, description: m.description, image: null as string | null },
    };
  }
  const title = str(doc.meta?.title);
  const page: PartnerFormPage = {
    meta: { title: title ?? doc.title, description: doc.meta?.description ?? "" },
    banner: fileUrl(doc.featuredImage),
    heading: doc.heading ?? "",
    intro: html(doc.content),
    formTitle: doc.formTitle ?? "",
    sections: (doc.sections ?? []).map((s) => ({
      title: str(s.title),
      ...(s.level ? { level: Number(s.level) } : {}),
      fields: (s.fields ?? []).map(toField),
    })),
  };
  return {
    crumb: doc.title,
    page,
    meta: {
      title: title ?? m.title,
      absolute: Boolean(title),
      description: str(doc.meta?.description) ?? m.description,
      image: fileUrl(doc.meta?.image),
    },
  };
}, "partner-page");

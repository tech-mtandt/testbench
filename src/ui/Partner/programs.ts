import type { PartnerFormPage, PartnerKey } from "@/content/partner-forms";

export type ProgramType = "dealer" | "vendor" | "customer";
export const programTypes: ProgramType[] = ["dealer", "vendor", "customer"];
/** `?type=` value → key in partner-forms.json */
export const programKey: Record<ProgramType, PartnerKey> = { dealer: "dealer", vendor: "vendors", customer: "customers" };
export const asProgramType = (t?: string): ProgramType => (programTypes.includes(t as ProgramType) ? (t as ProgramType) : "dealer");

export type Program = {
  type: ProgramType;
  name: string;
  pitch: string;
  points: { title: string; text: string }[];
  page: PartnerFormPage;
};

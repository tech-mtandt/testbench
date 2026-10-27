import type { AnnualReturnsPage } from "@/payload-types";
import { cached, fileUrl, readGlobal, str } from "@/cms/read";
import data from "@/content/scraped/annual-returns.json";

export type ReturnTab = { label: string; groups: { title: string; docs: { label: string; href: string }[] }[] };

const TITLE = "Investor Relations";
const DESCRIPTION =
  "Notices of general meetings, annual returns (MGT-7) and corporate social responsibility (CSR) disclosures of Mtandt Limited and Mtandt Rentals Limited.";

// Values carried over from the old "Annual Returns" page: replaced by the new name/description.
const legacyText = (s: string | null | undefined) => (s && /^annual returns?\b/i.test(s.trim()) ? null : s);
// The old banner image has "Annual Return" baked into it; the page uses a text banner instead.
const legacyBanner = (url: string | null) => (url && /an+ual-return/i.test(url) ? null : url);

/**
 * The /investor-relations page (formerly /annual-returns): one tab per company, each with
 * groups such as Notice of General Meeting, Annual Return and Corporate Social Responsibility.
 * Edited in the `annual-returns-page` global (admin: Pages > Investor Relations Page).
 */
export const getInvestorRelations = cached(async () => {
  const g = await readGlobal<AnnualReturnsPage>("annual-returns-page");
  if (!g) {
    return {
      banner: null as string | null,
      tabs: data.tabs as ReturnTab[],
      meta: { title: TITLE, absolute: false, description: DESCRIPTION, image: null as string | null },
    };
  }
  const title = legacyText(str(g.meta?.title));
  return {
    banner: legacyBanner(fileUrl(g.banner)),
    tabs: (g.tabs ?? []).map((t) => ({
      label: t.label,
      groups: (t.groups ?? []).map((gr) => ({
        title: gr.title,
        docs: (gr.docs ?? []).map((d) => ({ label: d.label, href: fileUrl(d.file) || d.href || "" })),
      })),
    })),
    meta: {
      title: title ?? TITLE,
      absolute: Boolean(title),
      description: legacyText(str(g.meta?.description)) ?? DESCRIPTION,
      image: fileUrl(g.meta?.image),
    },
  };
}, "annual-returns-page");

import customData from "@/content/scraped/custom-products.json";

// Custom products moved to ./customProducts (CMS-backed); re-exported for existing imports.
// Industries and case studies live in ./industries and ./caseStudies.
export type { CustomProduct, GalleryItem, Kind } from "./customProducts";
export { customProductParams, customProductPath, getCustomProduct } from "./customProducts";

export type CaseStudyCard = { title: string; text: string; href: string | null; image: string | null };

/** Legacy category segments that 301 to / duplicate another category on the live site
 * (scraped; the CMS keeps them per custom product as "Other category URLs"). */
export const categoryAliases: Record<string, string> = (customData as unknown as { aliases: Record<string, string> }).aliases;

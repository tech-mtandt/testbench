import type { Metadata } from "next";

const BRAND = /\bmt\s*(?:and|&)\s*t\b/i;

/**
 * Page title for metadata. Titles that already name the brand (many imported SEO titles end in
 * "| Mtandt" or "- Mtandt Group") are used as-is; others get the layout's "%s | MTandT" suffix.
 */
export const brandTitle = (title: string): Metadata["title"] => (BRAND.test(title) ? { absolute: title } : title);

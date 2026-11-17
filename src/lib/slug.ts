/**
 * A URL segment as the site serves it: trimmed, lowercase, runs of spaces as one hyphen. Slugs
 * typed in the admin can carry a trailing space or capitals ("…-mdx12dw ", "…-MDX32EWHD"),
 * which made pages unreachable or case-sensitive; addresses and lookups use this form.
 */
export const cleanSlug = (s: string) => s.trim().replace(/\s+/g, "-").toLowerCase();

/** A URL segment from a route param (possibly still percent-encoded, e.g. "%20") as a slug. */
export function addressSlug(param: string) {
  let s = param;
  try {
    s = decodeURIComponent(param);
  } catch {
    // Malformed escapes stay as typed.
  }
  return cleanSlug(s);
}

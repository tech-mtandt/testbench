import type { PayloadRequest } from "payload";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

/**
 * Address of a page's preview, for the admin's Live Preview panel and Preview button. It goes
 * through /api/preview (editors only), which turns on draft mode so the page shows unpublished
 * drafts, then opens the page. Built from the admin's own address, so dev.mtandt.com previews
 * on dev.mtandt.com (the preview needs the admin's login cookie).
 */
export function previewUrl(req: PayloadRequest | undefined, path: string | null | undefined): string | null {
  if (!path?.startsWith("/")) return null;
  const origin = req?.origin || SITE_URL;
  return `${origin}/api/preview?path=${encodeURIComponent(path)}`;
}

/** `path` as an address on this site (path + query), or null for anything else (no open redirects). */
export function ownPath(req: Request, path: string | null): string | null {
  if (!path?.startsWith("/")) return null;
  const here = new URL(req.url);
  const to = new URL(path, here);
  return to.origin === here.origin ? `${to.pathname}${to.search}` : null;
}

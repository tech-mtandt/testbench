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
  return `${adminOrigin(req)}/api/preview?path=${encodeURIComponent(path)}`;
}

/**
 * The address the editor's browser uses for the admin. Not `req.origin`: behind Vercel the app
 * sees plain http, and an http preview inside the https admin is blocked as mixed content.
 */
function adminOrigin(req: PayloadRequest | undefined): string {
  const header = (name: string) => req?.headers?.get(name)?.split(",")[0].trim() || null;
  const host = header("x-forwarded-host") ?? header("host");
  if (!host) return SITE_URL;
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return `${header("x-forwarded-proto") ?? (local ? "http" : "https")}://${host}`;
}

/** `path` as an address on this site (path + query), or null for anything else (no open redirects). */
export function ownPath(req: Request, path: string | null): string | null {
  if (!path?.startsWith("/")) return null;
  const here = new URL(req.url);
  const to = new URL(path, here);
  return to.origin === here.origin ? `${to.pathname}${to.search}` : null;
}

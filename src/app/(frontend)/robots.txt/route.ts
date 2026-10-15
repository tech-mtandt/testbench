// /robots.txt as a route handler inside the (frontend) group rather than app/robots.ts: with
// metadata files at the app root (outside both route groups) the Payload admin rendered an
// empty page. robots.ts only works at the root, so it is served here with the same output.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";
// Only the live domain is indexed; dev/staging deploys tell crawlers to stay out.
const LIVE = /^https:\/\/(www\.)?mtandt\.com\/?$/.test(SITE_URL);

export const dynamic = "force-static";

export function GET() {
  const body = LIVE
    ? `User-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
    : "User-Agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

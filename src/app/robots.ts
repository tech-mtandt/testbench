import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";
// Only the live domain is indexed; dev/staging deploys tell crawlers to stay out.
const LIVE = /^https:\/\/(www\.)?mtandt\.com\/?$/.test(SITE_URL);

export default function robots(): MetadataRoute.Robots {
  if (!LIVE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import { buildSearchIndex } from "@/lib/search-index";

// Static JSON index for the ⌘K palette; rebuilt hourly.
export const revalidate = 3600;

export async function GET() {
  return Response.json(await buildSearchIndex(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

import { permanentRedirect } from "next/navigation";

/** Legacy /search?q= — the catalog now handles search. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = [sp.q ?? sp.search].flat()[0]?.trim();
  permanentRedirect(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
}

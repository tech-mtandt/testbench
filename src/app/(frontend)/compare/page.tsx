import { permanentRedirect } from "next/navigation";

/** Legacy /compare?p=… — moved to /products/compare (which still understands ?p= legacy slugs). */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const p = [sp.p].flat()[0];
  permanentRedirect(p ? `/products/compare?p=${encodeURIComponent(p)}` : "/products/compare");
}

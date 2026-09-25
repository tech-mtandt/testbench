import { permanentRedirect } from "next/navigation";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const n = Number([(await searchParams).page].flat()[0]);
  permanentRedirect(`/media?type=articles${Number.isInteger(n) && n > 1 ? `&page=${n}` : ""}`);
}

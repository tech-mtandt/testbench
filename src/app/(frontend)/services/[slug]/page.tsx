import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, serviceSlugs } from "@/content/services";
import ServiceDetail from "@/ui/Services/ServiceDetail";
import ServiceHub from "@/ui/Services/ServiceHub";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return {
    title: s.scraped.meta.title || s.title,
    description: s.scraped.meta.description,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) notFound();
  return s.scraped.kind === "hub" ? (
    <ServiceHub data={s.scraped} title={s.title} />
  ) : (
    <ServiceDetail data={s.scraped} title={s.title} banners={s.banners} body={s.body} />
  );
}

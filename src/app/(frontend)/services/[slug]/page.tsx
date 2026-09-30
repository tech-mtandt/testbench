import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getService, getServiceSlugs } from "@/content/services";
import ServiceDetail from "@/ui/Services/ServiceDetail";
import ServiceHub from "@/ui/Services/ServiceHub";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return {
    title: s.seo.title ? { absolute: s.seo.title } : s.scraped.meta.title || s.title,
    description: s.seo.description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: s.seo.image ? { images: [s.seo.image] } : undefined,
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

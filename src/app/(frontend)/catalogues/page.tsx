import type { Metadata } from "next";
import { getCatalogues, getCataloguesPage } from "@/content/catalogues";
import CatalogueGrid from "@/ui/Catalogue/CatalogueGrid";
import ImageBanner from "@/ui/Contact/ImageBanner";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getCataloguesPage();
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description || undefined,
    alternates: { canonical: "/catalogues" },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}

export default async function Page() {
  const [page, catalogues] = await Promise.all([getCataloguesPage(), getCatalogues()]);
  return (
    <div className="bg-surface">
      <ImageBanner title={page.title} image={page.banner} crumbs={[{ label: page.title }]} />
      <CatalogueGrid catalogues={catalogues} categories={page.categories} />
    </div>
  );
}

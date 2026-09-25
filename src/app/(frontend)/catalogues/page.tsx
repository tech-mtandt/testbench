import type { Metadata } from "next";
import { mediaUrl, payloadClient } from "@/lib/payload";
import data from "@/content/scraped/catalogues.json";
import CatalogueGrid, { type CatalogueItem } from "@/ui/Catalogue/CatalogueGrid";
import ImageBanner from "@/ui/Contact/ImageBanner";

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/catalogues" },
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const scraped = new Map(data.items.map((i) => [norm(i.title), i]));

async function getCatalogues(): Promise<CatalogueItem[]> {
  try {
    const payload = await payloadClient();
    const { docs } = await payload.find({ collection: "catalogues", depth: 1, limit: 0 });
    const items = docs.map((doc) => {
      const s = scraped.get(norm(doc.title));
      const brand = doc.brand && typeof doc.brand === "object" ? doc.brand.title : null;
      const document = doc.document && typeof doc.document === "object" ? doc.document.url : null;
      return {
        order: s?.order ?? 999,
        item: {
          id: doc.id,
          title: doc.title,
          category: doc.category || s?.category || null,
          subcategory: doc.subcategory || s?.subcategory || null,
          brand: brand || s?.brand || null,
          posterUrl: mediaUrl(doc.poster) || s?.poster || null,
          fallbackPosterUrl: s?.poster ?? null,
          documentUrl: document || s?.pdf || null,
        },
      };
    });
    return items.sort((a, b) => a.order - b.order).map((x) => x.item);
  } catch (err) {
    console.error("[catalogues] DB read failed, using scrape", err);
    return data.items.map((s) => ({
      id: s.title,
      title: s.title,
      category: s.category,
      subcategory: s.subcategory,
      brand: s.brand,
      posterUrl: s.poster,
      documentUrl: s.pdf,
    }));
  }
}

export default async function Page() {
  const catalogues = await getCatalogues();
  return (
    <div className="bg-surface">
      <ImageBanner title="Catalogues" image={data.banner} crumbs={[{ label: "Catalogues" }]} />
      <CatalogueGrid catalogues={catalogues} categories={data.categories} />
    </div>
  );
}

import type { Catalogue, CataloguesPage } from "@/payload-types";
import { cached, fileUrl, readAll, readGlobal, str } from "@/cms/read";
import data from "@/content/scraped/catalogues.json";
import type { CatalogueItem } from "@/ui/Catalogue/CatalogueGrid";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const scraped = new Map(data.items.map((i) => [norm(i.title), i]));

/** Catalogues from the CMS (scraped values fill empty fields), or the scraped list before import. */
export const getCatalogues = cached(async (): Promise<CatalogueItem[]> => {
  const docs = await readAll<Catalogue>("catalogues", { depth: 1 });
  if (!docs) {
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
  const items = docs.map((doc) => {
    const s = scraped.get(norm(doc.title));
    const brand = doc.brand && typeof doc.brand === "object" ? doc.brand.title : null;
    return {
      order: doc.order ?? s?.order ?? 999,
      item: {
        id: doc.id,
        title: doc.title,
        category: doc.category || s?.category || null,
        subcategory: doc.subcategory || s?.subcategory || null,
        brand: brand || s?.brand || null,
        posterUrl: fileUrl(doc.poster) || s?.poster || null,
        fallbackPosterUrl: s?.poster ?? null,
        documentUrl: fileUrl(doc.document) || s?.pdf || null,
      },
    };
  });
  return items.sort((a, b) => a.order - b.order).map((x) => x.item);
}, "catalogues");

/** The /catalogues page: banner, category filter and SEO. */
export const getCataloguesPage = cached(async () => {
  const g = await readGlobal<CataloguesPage>("catalogues-page");
  if (!g) {
    return {
      title: "Catalogues",
      banner: data.banner,
      categories: data.categories,
      meta: { title: data.meta.title, absolute: false, description: data.meta.description, image: null },
    };
  }
  const title = str(g.meta?.title);
  return {
    title: g.title,
    banner: fileUrl(g.banner),
    categories: (g.categories ?? []).map((c) => c.value),
    meta: {
      title: title ?? g.title,
      absolute: Boolean(title),
      description: str(g.meta?.description) ?? "",
      image: fileUrl(g.meta?.image),
    },
  };
}, "catalogues-page");

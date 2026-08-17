import configPromise from "@payload-config";
import { getPayload } from "payload";
import CatalogueGrid, {
  type CatalogueItem,
} from "@/ui/Catalogue/CatalogueGrid";

export default async function Page() {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: "catalogues",
    depth: 1,
    limit: 0,
    sort: "title",
  });

  const catalogues: CatalogueItem[] = docs.map((doc) => {
    const poster =
      doc.poster && typeof doc.poster === "object" ? doc.poster : null;
    const brand = doc.brand && typeof doc.brand === "object" ? doc.brand : null;
    const document =
      doc.document && typeof doc.document === "object" ? doc.document : null;

    return {
      id: doc.id,
      title: doc.title,
      category: doc.category ?? null,
      subcategory: doc.subcategory ?? null,
      brand: brand?.title ?? null,
      posterUrl: poster?.url ?? null,
      posterAlt: poster?.alt ?? doc.title,
      documentUrl: document?.url ?? null,
    };
  });

  return (
    <div className="min-h-[80vh] py-12">
      <CatalogueGrid catalogues={catalogues} />
    </div>
  );
}

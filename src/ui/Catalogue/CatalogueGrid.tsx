import CatalogueBrowser from "./CatalogueBrowser";

export type CatalogueItem = {
  id: number | string;
  title: string;
  category: string | null;
  subcategory: string | null;
  brand: string | null;
  posterUrl: string | null;
  /** Local legacy copy, used if the Payload media URL fails to load. */
  fallbackPosterUrl?: string | null;
  documentUrl: string | null;
};

/**
 * Catalogue filters and grid. A server component so the PDF links stay on the server: the
 * browser gets posters and ids, and submitForm hands out a PDF link once its download form
 * is sent.
 */
export default function CatalogueGrid({ catalogues, categories }: { catalogues: CatalogueItem[]; categories: string[] }) {
  const cards = catalogues.map(({ documentUrl: _documentUrl, ...card }) => card);
  return <CatalogueBrowser catalogues={cards} categories={categories} />;
}

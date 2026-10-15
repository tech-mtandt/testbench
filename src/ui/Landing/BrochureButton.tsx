import { getCatalogues } from "@/content/catalogues";
import BrochureModal from "./BrochureModal";

/**
 * "Download Brochure" button: a short name + phone form, then the PDF link. A server
 * component so `href` (a catalogue's PDF, from getCatalogues) stays on the server: the
 * browser gets that catalogue's id, and submitForm returns the link once the form is sent.
 */
export default async function BrochureButton({
  title,
  href,
  page,
  className,
}: {
  title: string;
  href: string | null;
  page: string;
  className?: string;
}) {
  const id = href ? (await getCatalogues().catch(() => [])).find((c) => c.documentUrl === href)?.id : null;
  return <BrochureModal title={title} catalogue={id == null ? null : String(id)} page={page} className={className} />;
}

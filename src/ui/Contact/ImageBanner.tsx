import { Breadcrumbs, type Crumb } from "@/ui/PageChrome";

/** Legacy sub-header: the banner artwork already carries the page title, so the h1 is visually hidden. */
export default function ImageBanner({ title, image, crumbs }: { title: string; image?: string | null; crumbs: Crumb[] }) {
  return (
    <section
      className="relative h-28 bg-[#e9ecef] bg-cover bg-center sm:h-40 md:h-[190px]"
      style={image ? { backgroundImage: `url("${image}")` } : undefined}
    >
      <div className="default-margin pt-2.5">
        <Breadcrumbs items={crumbs} />
      </div>
      <h1 className="sr-only">{title}</h1>
    </section>
  );
}

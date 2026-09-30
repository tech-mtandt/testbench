import type { Metadata } from "next";
import { getMediaPages } from "@/content/media";
import Lightbox from "@/ui/Media/Lightbox";
import MediaBanner from "@/ui/Media/MediaBanner";
import MediaTabs from "@/ui/Media/MediaTabs";

export async function generateMetadata(): Promise<Metadata> {
  const seo = (await getMediaPages()).seo.gallery;
  return {
    title: seo?.title ? { absolute: seo.title } : "Gallery",
    description: seo?.description || "Photos and videos of Mtandt Group equipment, projects and solutions on site.",
    alternates: { canonical: "/media/gallery" },
  };
}

export default async function Page() {
  const { gallery } = await getMediaPages();
  return (
    <>
      <MediaBanner />
      <MediaTabs active="gallery" />
      <div className="default-margin py-8 md:py-10">
        <Lightbox items={gallery} thumbClassName="aspect-[4/3] shadow-[0_0_3px_rgb(0_0_0/.12)]" />
      </div>
    </>
  );
}

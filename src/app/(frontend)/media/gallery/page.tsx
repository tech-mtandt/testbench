import type { Metadata } from "next";
import { gallery } from "@/content/media";
import Lightbox from "@/ui/Media/Lightbox";
import MediaBanner from "@/ui/Media/MediaBanner";
import MediaTabs from "@/ui/Media/MediaTabs";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos of Mtandt Group equipment, projects and solutions on site.",
  alternates: { canonical: "/media/gallery" },
};

export default function Page() {
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

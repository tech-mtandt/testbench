import configPromise from "@payload-config";
import { getPayload } from "payload";
import Breadcrumb from "@/ui/Breadcrumb";
import MediaTabs, { type MediaItem } from "@/ui/Media/MediaTabs";

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise });

  const [{ docs: blogs }, { docs: press }, { docs: events }, { docs: gallery }] =
    await Promise.all([
      payload.find({ collection: "blogs", depth: 1, limit: 24, sort: "-publishedDate" }),
      payload.find({ collection: "press", depth: 1, limit: 24, sort: "-publishedDate" }),
      payload.find({ collection: "events", depth: 1, limit: 24, sort: "-fromDate" }),
      payload.find({ collection: "gallery", depth: 1, limit: 24, sort: "-createdAt" }),
    ]);

  const items: Record<"blogs" | "press" | "events" | "gallery", MediaItem[]> = {
    blogs: blogs.map((doc) => {
      const hero = doc.hero && typeof doc.hero === "object" ? doc.hero : null;
      const thumbnail = doc.thumbnail && typeof doc.thumbnail === "object" ? doc.thumbnail : null;
      const image = hero ?? thumbnail;
      return {
        id: doc.id,
        title: doc.title,
        href: `/media/blogs/${doc.slug}`,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt || doc.title,
        badge: doc.category ?? null,
        date: formatDate(doc.publishedDate),
      };
    }),
    press: press.map((doc) => {
      const hero = doc.hero && typeof doc.hero === "object" ? doc.hero : null;
      const thumbnail = doc.thumbnail && typeof doc.thumbnail === "object" ? doc.thumbnail : null;
      const image = hero ?? thumbnail;
      return {
        id: doc.id,
        title: doc.title,
        href: `/media/press/${doc.slug}`,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt || doc.title,
        badge: doc.category ?? null,
        date: formatDate(doc.publishedDate),
      };
    }),
    events: events.map((doc) => {
      const hero = doc.hero && typeof doc.hero === "object" ? doc.hero : null;
      const thumbnail = doc.thumbnail && typeof doc.thumbnail === "object" ? doc.thumbnail : null;
      const image = hero ?? thumbnail;
      return {
        id: doc.id,
        title: doc.title,
        href: `/media/events/${doc.slug}`,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt || doc.title,
        badge: doc.eventName || doc.category || null,
        date: formatDate(doc.fromDate),
      };
    }),
    gallery: gallery.map((doc) => {
      const image =
        doc.featuredImage && typeof doc.featuredImage === "object" ? doc.featuredImage : null;
      return {
        id: doc.id,
        title: doc.title,
        href: `/media/gallery/${doc.slug}`,
        imageUrl: image?.url ?? null,
        imageAlt: image?.alt || doc.title,
        badge: null,
        date: null,
      };
    }),
  };

  return (
    <div>
      <div className="relative flex h-[260px] w-full flex-col overflow-hidden bg-[#2c2c2c]">
        <div className="default-margin relative z-10 pt-4">
          <Breadcrumb items={[{ label: "Home", href: "/" }]} variant="light" />
        </div>
        <div className="relative z-10 flex flex-1 items-center px-4 md:px-16">
          <h1 className="text-5xl font-bold text-white/20 uppercase md:text-7xl">Media</h1>
        </div>
      </div>

      <MediaTabs items={items} />
    </div>
  );
}

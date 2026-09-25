import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPage } from "@/content/media";
import BlogGrid from "@/ui/Media/BlogGrid";
import MediaBanner from "@/ui/Media/MediaBanner";
import MediaTabs from "@/ui/Media/MediaTabs";
import Pagination, { parsePage } from "@/ui/Media/Pagination";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Insights, guides and updates from Mtandt Group on access equipment, work at height safety and rentals.",
  alternates: { canonical: "/media/blogs" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string | string[] }> }) {
  const page = parsePage((await searchParams).page);
  const { cards, totalPages } = await getBlogPage(page);
  if (page > 1 && !cards.length) notFound();

  return (
    <>
      <MediaBanner />
      <MediaTabs active="blogs" />
      <div className="default-margin py-8 md:py-10">
        <BlogGrid posts={cards} />
        <Pagination page={page} totalPages={totalPages} basePath="/media/blogs" />
      </div>
    </>
  );
}

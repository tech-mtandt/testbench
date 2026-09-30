import { permanentRedirect } from "next/navigation";

// Legacy duplicate of /blogs/[slug] (it also showed unpublished drafts); the post lives there.
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/blogs/${(await params).slug}`);
}

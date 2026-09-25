import { permanentRedirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  permanentRedirect(`/event/${(await params).slug}`);
}

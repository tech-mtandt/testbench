import { permanentRedirect } from "next/navigation";

/** Legacy URL — case studies moved to /case-studies/[slug]. */
export default async function LegacyCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/case-studies/${slug}`);
}

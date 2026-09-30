import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/ui/PageChrome";
import IndustryIcon from "@/ui/CustomProduct/IndustryIcon";
import { TitleBanner } from "@/ui/CustomProduct/Sections";
import { getIndustriesPage, getIndustryIndex } from "@/content/industries";

export async function generateMetadata(): Promise<Metadata> {
  // Admin SEO tab (Pages > Industries Page > SEO) wins; empty fields keep the original meta.
  const seo = (await getIndustriesPage()).seo;
  return {
    title: seo?.title ? { absolute: seo.title } : "Industries",
    description:
      seo?.description ||
      "Industries served by Mtandt Group: railway, aviation, automobile, energy, hotels & buildings, FMCG/warehouses and events.",
    alternates: { canonical: "/industries" },
    openGraph: seo?.image ? { images: [seo.image] } : undefined,
  };
}

export default async function IndustriesPage() {
  const [page, industryIndex] = await Promise.all([getIndustriesPage(), getIndustryIndex()]);
  return (
    <main>
      <TitleBanner title={page.title} image={page.banner} crumbs={<Breadcrumbs items={[{ label: "Industries" }]} />} />
      <section className="bg-surface py-12 md:py-16">
        <div className="default-margin grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {industryIndex.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col items-center border-b-[6px] border-brand bg-white px-6 pb-10 pt-8 text-center no-underline shadow-[0_0_20px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1"
            >
              <span className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-brand text-ink">
                <IndustryIcon name={c.icon} className="h-8 w-8" />
              </span>
              <h2 className="mt-5 text-xl font-bold text-ink">{c.title}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

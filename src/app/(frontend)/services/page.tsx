import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/ui/PageChrome";
import { bgLayers, getServicesPage, listServices } from "@/content/services";
import { bgUrl } from "@/lib/img";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getServicesPage();
  return {
    title: meta.absolute ? { absolute: meta.title } : meta.title,
    description: meta.description,
    alternates: { canonical: "/services" },
    openGraph: meta.image ? { images: [meta.image] } : undefined,
  };
}

export default async function Page() {
  const [page, services] = await Promise.all([getServicesPage(), listServices()]);
  return (
    <>
      <section
        className="relative h-32 bg-[#e9ecef] bg-cover bg-center md:h-48"
        style={page.banner ? { backgroundImage: `url("${bgUrl(page.banner)}")` } : undefined}
      >
        <div className="default-margin pt-3">
          <Breadcrumbs items={[{ label: page.title }]} />
        </div>
        <h1 className="sr-only">{page.title}</h1>
      </section>
      <section className="bg-surface py-12">
        <div className="default-margin">
          <h2 className="mb-3 text-xl font-semibold text-ink">{page.title}</h2>
          <div className="grid gap-x-1.5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {services.map((s) => (
              <div
                key={s.slug}
                className="group relative h-[385px] overflow-hidden border-[3px] border-white bg-neutral-500 bg-cover bg-center"
                style={bgLayers(s.images)}
              >
                <Link href={`/services/${s.slug}`} className="absolute inset-0 z-10 md:hidden" aria-label={s.title} />
                <div className="absolute inset-0 bg-[rgba(72,72,72,0.3)] transition-colors group-hover:bg-black/50" />
                <div className="absolute inset-x-0 bottom-6 px-8 transition-all duration-300">
                  <h3 className="text-[22px] font-bold leading-tight text-white group-hover:mb-3">{s.title}</h3>
                  <div className="hidden group-hover:block">
                    <p className="mb-6 text-sm font-light text-white">{s.excerpt}</p>
                    <Link
                      href={`/services/${s.slug}`}
                      className="relative z-20 inline-block border-2 border-[#ffeb3b] px-3 py-1.5 text-sm font-semibold uppercase tracking-wider text-white no-underline transition-colors hover:bg-[#ffeb3b] hover:text-ink"
                    >
                      {s.button || "Read More"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import Img from "@/ui/Img";
import { SectionTitle } from "@/ui/PageChrome";
import type { ServiceHubData } from "@/content/services";
import InquiryForm from "./InquiryForm";

/** Brand hub pages (CESL, EQUIPR, EAT): about, sub-service cards, why-choose, supported equipment. */
export default function ServiceHub({ data, title }: { data: ServiceHubData; title: string }) {
  const { services, why, supported } = data;
  return (
    <>
      <section className="bg-white py-12">
        <div className="default-margin">
          <div className="text-center">
            {data.logo?.src && <Img src={data.logo.src} alt={data.logo.alt} className="mx-auto h-auto max-h-20 w-auto" />}
            {data.tagline && <p className="mt-2 text-lg font-semibold text-ink md:text-xl">{data.tagline}</p>}
          </div>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
            <div className="min-w-0">
              <h1 className="mb-3 text-3xl font-semibold text-ink md:text-4xl">{data.aboutTitle}</h1>
              <div
                className="text-[15px] leading-relaxed text-ink-soft [&_a]:text-ink [&_b]:text-[17px] [&_b]:text-ink"
                dangerouslySetInnerHTML={{ __html: data.aboutHtml }}
              />
            </div>
            {data.aboutImage?.src && (
              <div className="min-w-0">
                <Img src={data.aboutImage.src} alt={data.aboutImage.alt} className="mx-auto block h-auto max-w-full" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#efefef] py-12">
        <div className="default-margin">
          <SectionTitle>{services.title}</SectionTitle>
          {services.intro && <p className="mt-4 max-w-4xl text-lg text-ink-soft md:text-xl">{services.intro}</p>}
          <div
            className={`mt-8 grid gap-6 sm:grid-cols-2 ${services.items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}
          >
            {services.items.map((it) => (
              <div key={it.title} className="relative flex min-w-0 flex-col bg-white p-4 pb-12">
                {it.image && (
                  <Img src={it.image} alt={it.alt} className="mb-4 aspect-[16/10] w-full object-cover" />
                )}
                <h3 className="mb-3 text-lg font-semibold leading-snug text-ink">{it.title}</h3>
                <p className="text-sm leading-relaxed text-ink">{it.text}</p>
                {it.href && (
                  <Link
                    href={it.href}
                    aria-label={`Know more about ${it.title}`}
                    className="absolute bottom-0 right-0 flex h-9 w-14 items-center justify-center rounded-tl-[2.5rem] bg-brand text-xl text-ink no-underline transition-colors hover:bg-ink hover:text-brand"
                  >
                    →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[radial-gradient(ellipse_at_center,#3a3d42_0%,#1d1f22_100%)] py-12 text-white">
        <div className="default-margin">
          <SectionTitle yellow className="!text-brand">
            {why.title}
          </SectionTitle>
          {why.intro && <p className="mt-4 max-w-4xl text-lg !text-white md:text-xl">{why.intro}</p>}
          <div
            className={`mt-8 grid gap-6 sm:grid-cols-2 ${why.items.length > 4 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}
          >
            {why.items.map((w, i) => (
              <div key={i} className="flex min-w-0 flex-col justify-center border border-brand p-4 text-center">
                {w.title && <h3 className="mb-2 text-base font-medium !text-white">{w.title}</h3>}
                <p className="text-[13px] leading-relaxed !text-[#bbb]">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {supported && (
        <section className="bg-brand-cream py-12">
          <div className="default-margin">
            <SectionTitle>{supported.title}</SectionTitle>
            {supported.intro && <p className="mt-4 text-lg text-ink-soft md:text-xl">{supported.intro}</p>}
            <div className="mt-6 grid items-center gap-8 md:grid-cols-[2fr_3fr]">
              <div className="min-w-0">
                {supported.image?.src && (
                  <Img src={supported.image.src} alt={supported.image.alt} className="h-auto max-w-full" />
                )}
              </div>
              <div
                className="min-w-0 text-[15px] text-ink [&_b]:font-semibold [&_li]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: supported.html }}
              />
            </div>
          </div>
        </section>
      )}

      {data.brochure && (
        <div className="pt-8 text-center">
          <a href={data.brochure} download className="btn-yellow">
            Downloads
          </a>
        </div>
      )}
      <InquiryForm service={title} />
    </>
  );
}

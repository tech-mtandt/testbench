import type { Metadata } from "next";
import { PageBanner, SectionTitle } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import { ChevronDown } from "@/ui/Icons";
import ApplyButton from "@/ui/Career/ApplyButton";
import CareerForm from "@/ui/Career/CareerForm";
import data from "@/content/scraped/career.json";

export const metadata: Metadata = {
  title: "Careers | Mtandt Group",
  description:
    "Join Mtandt Group - for the ones who get it done, Dil Se. Explore current openings and apply with your resume.",
  alternates: { canonical: "/career" },
};

export default function Page() {
  return (
    <>
      <PageBanner title={data.title} image={data.banner} crumbs={[{ label: "Career" }]} />

      <section className="bg-[radial-gradient(ellipse_at_center,#3a3d42_0%,#1d1f22_100%)] py-10 text-white md:py-12">
        <div className="default-margin grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="min-w-0">
            <SectionTitle yellow className="!text-brand">
              {data.heading}
            </SectionTitle>
            <p className="mt-2 text-[15px] font-medium italic !text-white">{data.tagline}</p>
            <div
              className="mt-5 [&_b]:font-semibold [&_b]:!text-white [&_p]:mb-4 [&_p]:text-[15px] [&_p]:!text-white"
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-4 sm:mx-auto sm:max-w-md">
            {data.images.map((src, i) => (
              <Img
                key={src}
                src={src}
                alt="Career Image"
                className={`aspect-square w-full bg-white object-cover ${i % 2 ? "translate-y-4" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      {data.jobs.length > 0 && (
        <section className="bg-white py-10">
          <div className="default-margin space-y-3">
            {data.jobs.map((j) => (
              <details key={j.title} className="group rounded-md border border-neutral-200 bg-surface">
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                  {j.title}
                </summary>
                <div className="px-5 pb-5 md:px-14">
                  <div
                    className="prose-legacy text-sm leading-relaxed text-ink [&_b]:text-ink [&_ul]:mb-3"
                    dangerouslySetInnerHTML={{ __html: j.html }}
                  />
                  <ApplyButton post={j.title} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      <section id="interest-form" className="scroll-mt-24 bg-white pb-12 pt-4">
        <div className="default-margin">
          <h2 className="text-center text-2xl font-bold text-ink">{data.form.title}</h2>
          <p className="mt-1 text-center text-lg text-ink-soft">{data.form.subtitle}</p>
          <div className="mx-auto mt-5 max-w-[540px] bg-[#dcdcdc] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] md:p-6">
            <CareerForm functionalAreas={data.form.functionalAreas} education={data.form.education} />
          </div>
        </div>
      </section>
    </>
  );
}

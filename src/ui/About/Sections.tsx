import Link from "next/link";
import Img from "@/ui/Img";
import Carousel from "@/ui/Carousel";
import { SectionTitle } from "@/ui/PageChrome";
import data from "@/content/scraped/about.json";

type About = typeof data;

export function Principles({ title, items }: { title: string; items: About["principles"] }) {
  return (
    <section id="group-principle" className="scroll-mt-28 bg-white py-12">
      <div id="groupprinciple" className="default-margin">
        <SectionTitle className="mb-6">{title}</SectionTitle>
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <article
              key={p.title}
              className="group overflow-hidden bg-[#F4F0D1] px-6 pt-4 transition-all duration-500 hover:rounded-[40px_0] hover:bg-black"
            >
              {p.icon && (
                <div
                  aria-hidden
                  className="flex justify-end [&_svg]:h-auto [&_svg]:w-1/3 [&_svg]:transition-transform [&_svg]:duration-500 group-hover:[&_svg]:scale-110"
                  dangerouslySetInnerHTML={{ __html: p.icon }}
                />
              )}
              <h3 className="mt-1 text-4xl leading-none font-bold uppercase text-black group-hover:text-[#F8EA0D]">
                <span className="block text-xl text-[#444] group-hover:text-white">{p.prefix}</span>
                {p.title}
              </h3>
              <div
                className="mt-3 text-sm text-black group-hover:text-white [&_b]:font-semibold [&_li]:mb-0.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: p.html }}
              />
              {p.art && (
                <div
                  aria-hidden
                  className="mt-4 [&_svg]:h-auto [&_svg]:w-1/2 [&_svg]:transition-transform [&_svg]:duration-500 group-hover:[&_svg]:rotate-[10deg] group-hover:[&_svg]:scale-110"
                  dangerouslySetInnerHTML={{ __html: p.art }}
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PoweringProgress({
  title,
  tagline,
  cards,
}: {
  title: string;
  tagline?: string | null;
  cards: { id?: string | null; label: string; description?: string | null }[];
}) {
  return (
    <section id="PoweringProgress" className="scroll-mt-28 bg-white pb-8">
      <div className="default-margin">
        <SectionTitle className="uppercase">{title}</SectionTitle>
        {tagline && <p className="mt-3 text-ink">{tagline}</p>}
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.id ?? c.label}
              className="group rounded-md border border-neutral-400 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            >
              <span className="inline-block rounded-br-md bg-brand px-4 py-1.5 text-xs font-bold uppercase text-[#444]">
                {c.label}
              </span>
              <p className="px-4 pt-3 pb-5 text-sm text-ink">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GroupCompanies({ title, items }: { title: string; items: About["companies"] }) {
  return (
    <section id="bussiness-unit" className="scroll-mt-28 bg-[#eee] py-12">
      <div className="default-margin">
        <SectionTitle className="mb-6 uppercase">{title}</SectionTitle>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <Link
              key={c.title}
              href={c.href || "/"}
              className="block rounded-[10px] bg-white px-6 py-4 no-underline shadow-[0_0_14px_rgba(0,0,0,0.13)] transition-shadow hover:shadow-[0_0_18px_rgba(0,0,0,0.22)]"
            >
              <Img src={c.icon ?? undefined} alt="" className="h-8 w-8 object-contain" />
              <h3 className="mt-3 text-base font-semibold text-[#343434]">{c.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyMtandt({ why }: { why: About["why"] }) {
  return (
    <section
      id="WhyMTandT"
      className="scroll-mt-28 bg-[#1b1d21] bg-cover bg-center py-12"
      style={{ backgroundImage: `url("${why.bg}")` }}
    >
      <div className="default-margin">
        <h2 className="relative mb-6 pl-3 text-2xl font-bold uppercase text-[#FFEB3B] before:absolute before:top-1 before:bottom-1 before:left-0 before:w-[3px] before:bg-[#FFEB3B] md:text-3xl">
          {why.title}
        </h2>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <ul className="max-h-[400px] overflow-y-auto pr-3 lg:col-span-7 [scrollbar-color:#25282d_#191b1f] [scrollbar-width:thin]">
            {why.points.map((p) => (
              <li
                key={p}
                className="relative mb-4 bg-no-repeat pl-6 text-white/80 transition-colors hover:text-[#FFE61C]"
                style={{ backgroundImage: `url("${why.bullet}")`, backgroundPosition: "0 4px" }}
              >
                {p}
              </li>
            ))}
          </ul>
          <div className="lg:col-span-5">
            <Img src={why.image ?? undefined} alt="Mtandt at work" className="mx-auto h-auto w-full max-w-md" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Journey({ journey }: { journey: About["journey"] }) {
  return (
    <section id="OurJourney" className="scroll-mt-28 bg-white pt-12 pb-16">
      <div className="default-margin">
        <SectionTitle>{journey.title}</SectionTitle>
        <p className="mt-3 text-ink">{journey.intro}</p>
      </div>
      <div className="mt-6 bg-no-repeat pl-0 lg:pl-[5%]" style={{ backgroundImage: `url("${journey.bg}")`, backgroundPosition: "2% 0" }}>
        <Carousel>
          {journey.items.map((j) => (
            <div key={j.year} className="group relative w-[260px] shrink-0 snap-start text-center sm:w-[300px]">
              <div className="flex h-[78px] items-end justify-center px-12 opacity-0 transition-opacity group-hover:opacity-100">
                <Img src={j.image ?? undefined} alt="" className="max-h-[78px] w-auto" />
              </div>
              <p className="relative h-7 text-xl font-bold text-[#666] group-hover:font-extrabold group-hover:text-black">
                {j.year}
                <span className="absolute top-[47px] left-1/2 h-1 w-7 -translate-x-1/2 bg-[#FFE61C]" />
              </p>
              <div
                aria-hidden
                className="h-10 w-full bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${journey.road}")`, backgroundSize: "100%" }}
              />
              <p className="px-2 text-[15px] font-medium text-[#666]">{j.title}</p>
              <p className="mx-2 mt-3 rounded-lg bg-gradient-to-b from-[#545454] to-[#18191D] p-4 text-sm text-white opacity-0 shadow-[0_0_14px_2px_rgba(0,0,0,0.2)] transition-opacity group-hover:opacity-100">
                {j.text}
              </p>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

export function AccreditationsAwards({ acc, awards }: { acc: About["accreditations"]; awards: About["awards"] }) {
  return (
    <section
      id="accreditations"
      className="scroll-mt-28 bg-[#FFFDDB] bg-no-repeat py-12 lg:bg-[length:54%_100%] lg:bg-right"
      style={{ backgroundImage: `url("${acc.bg}")` }}
    >
      <div className="default-margin grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="lg:pr-10">
          <SectionTitle className="mb-3">{acc.title}</SectionTitle>
          <p className="text-ink">{acc.text}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {acc.logos.map((src) => (
              <Img key={src} src={src ?? undefined} alt="Divisional accreditation" className="h-auto max-w-[110px]" />
            ))}
          </div>
        </div>
        <div id="awards" className="scroll-mt-28 lg:pl-10">
          <SectionTitle className="mb-3">{awards.title}</SectionTitle>
          <p className="text-ink">{awards.text}</p>
          {awards.images.map((src) => (
            <Img key={src} src={src ?? undefined} alt={awards.title} className="mt-4 h-auto max-w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

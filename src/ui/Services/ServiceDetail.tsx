import { Breadcrumbs } from "@/ui/PageChrome";
import Img from "@/ui/Img";
import { RichText } from "@/components/RichText";
import { bgLayers, type ServiceDetailData } from "@/content/services";
import type { Service } from "@/payload-types";
import FeatureIcon from "./FeatureIcon";
import InquiryForm from "./InquiryForm";

const BODY =
  "prose-legacy text-[15px] leading-relaxed text-ink [&_h2]:text-xl [&_h3]:text-xl [&_h4]:text-xl [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:text-ink [&_li]:mb-0.5";

type Props = {
  data: ServiceDetailData;
  title: string;
  banners: string[];
  body: Service["body"] | null;
};

export default function ServiceDetail({ data, title, banners, body }: Props) {
  const crumbs = data.crumbs.map((c) => ({ label: c.label, href: c.href ?? undefined }));
  const features = data.features.filter((f) => f.title || f.html);
  return (
    <>
      <section
        className="relative flex min-h-36 items-center justify-center bg-ink bg-cover bg-center md:min-h-48"
        style={bgLayers(banners)}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="default-margin absolute inset-x-0 top-3 z-10">
          <Breadcrumbs items={crumbs} light />
        </div>
        <h1 className="relative z-10 px-4 text-center text-3xl font-bold uppercase tracking-wider !text-white md:text-5xl">
          {data.bannerTitle || "Equipment Management"}
        </h1>
      </section>
      <section className="bg-surface pb-4 pt-8">
        <div className="default-margin">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-8">
            <div className="min-w-0">
              <h2 className="mb-4 text-xl font-bold uppercase text-ink md:text-2xl">{data.heading || title}</h2>
              {data.subheading && <h3 className="mb-3 text-xl font-bold capitalize">{data.subheading}</h3>}
              {body ? (
                <RichText data={body as never} className={BODY} />
              ) : (
                <div className={BODY} dangerouslySetInnerHTML={{ __html: data.html }} />
              )}
            </div>
            <div className="min-w-0">
              {data.image && <Img src={data.image} alt={title} className="mx-auto block h-auto w-full" />}
              {data.brochure && (
                <div className="mt-4 text-center">
                  <a href={data.brochure} download className="btn-yellow">
                    Downloads
                  </a>
                </div>
              )}
            </div>
          </div>

          {features.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((f, i) => (
                <div key={i} className="p-6 text-center">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ffeb3b] text-ink shadow-[0_8px_20px_-2px_rgba(158,152,153,0.5)]">
                    <FeatureIcon icon={f.icon} className="h-6 w-6" />
                  </span>
                  {f.title && <h4 className="mt-4 font-bold capitalize text-ink">{f.title}</h4>}
                  <div className="mt-4 text-[15px] text-ink [&_p]:m-0" dangerouslySetInnerHTML={{ __html: f.html }} />
                </div>
              ))}
            </div>
          )}

          {data.cta && (
            <div className="mt-6 text-center">
              {data.cta.text && <p className="mb-3 font-semibold">{data.cta.text}</p>}
              {data.cta.href && (
                <a href={data.cta.href} className="btn-dark">
                  {data.cta.label}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
      <div className="bg-surface">
        <InquiryForm service={title} />
      </div>
    </>
  );
}

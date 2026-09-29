import type { Metadata } from "next";
import { partnerForms, partnerMeta, type PartnerKey } from "@/content/partner-forms";
import ImageBanner from "@/ui/Contact/ImageBanner";
import PartnerForm from "./PartnerForm";

export function partnerMetadata(key: PartnerKey): Metadata {
  const m = partnerMeta[key];
  return { title: m.title, description: m.description, alternates: { canonical: `/${key}` } };
}

export default function PartnerPage({ page }: { page: PartnerKey }) {
  const d = partnerForms[page];
  const m = partnerMeta[page];
  return (
    <>
      <ImageBanner title={m.crumb} image={d.banner} crumbs={[{ label: m.crumb }]} />
      <section className="bg-white pt-10 pb-4">
        <div className="default-margin">
          <h2 className="text-2xl font-semibold text-ink">{d.heading}</h2>
          <div
            className="prose-legacy mt-3 text-sm text-ink [&_ol]:pl-5 [&_b]:text-ink [&_a]:no-underline"
            dangerouslySetInnerHTML={{ __html: d.intro }}
          />
        </div>
      </section>
      <section className="bg-white pb-14">
        <div className="mx-auto w-full max-w-[1230px] px-4 md:px-4">
          <PartnerForm form={page} title={d.formTitle} sections={d.sections} />
        </div>
      </section>
    </>
  );
}

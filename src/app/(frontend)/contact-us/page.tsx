import type { Metadata } from "next";
import data from "@/content/scraped/contact.json";
import { contactFields } from "@/content/forms";
import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";
import ImageBanner from "@/ui/Contact/ImageBanner";
import Offices, { type Region } from "@/ui/Contact/Offices";
import ShareThoughts from "@/ui/Contact/ShareThoughts";
import { getDbContact, mergeOffice } from "@/ui/Contact/db";

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/contact-us" },
};

export default async function Page() {
  const db = await getDbContact();
  const regions: Region[] = data.regions.map((r) => ({
    ...r,
    cities: r.cities.map((c) => ({ ...c, offices: c.offices.map((o) => mergeOffice(o, db)) })),
  }));

  return (
    <>
      <ImageBanner title="Contact Us" image={data.banner} crumbs={[{ label: "Contact-Us" }]} />

      <section className="bg-white pt-10 md:pt-14">
        <div className="default-margin">
          <div className="bg-[#f2f2f2] px-5 py-8 md:px-9 md:py-11">
            <h2 className="text-2xl font-medium uppercase text-ink md:text-[28px]">{db?.title || data.heading}</h2>
            <p className="mt-2 mb-6 flex items-center gap-2 text-xs font-semibold uppercase text-ink">
              <span aria-hidden className="h-px w-9 bg-ink" />
              <span aria-hidden className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-ink" />
                <span className="h-1 w-1 rounded-full bg-ink" />
              </span>
              <span className="ml-2">{data.subheading}</span>
            </p>
            <div className="md:px-2.5">
              <LeadForm form="contact" fields={contactFields} hidden={{ page: "contact-us" }} submitLabel="Submit" />
            </div>
          </div>
        </div>
      </section>

      <ShareThoughts
        title={data.share.title}
        text={data.share.text}
        button={data.share.button}
        bg={data.share.bg}
        formTitle={data.share.formTitle}
        fields={data.share.fields as FieldDef[]}
      />

      <section className="bg-white py-12">
        <div className="default-margin">
          <Offices regions={regions} />
        </div>
      </section>
    </>
  );
}

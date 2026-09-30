import type { Metadata } from "next";
import data from "@/content/scraped/contact.json";
import { contactFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import ImageBanner from "@/ui/Contact/ImageBanner";
import Offices from "@/ui/Contact/Offices";
import ShareThoughts from "@/ui/Contact/ShareThoughts";
import { getContact } from "@/ui/Contact/data";

export async function generateMetadata(): Promise<Metadata> {
  // Admin SEO tab (Pages > Contact Page > SEO) wins; empty fields keep the legacy meta.
  const seo = (await getContact()).seo;
  return {
    title: seo?.title ? { absolute: seo.title } : data.meta.title,
    description: seo?.description || data.meta.description,
    alternates: { canonical: "/contact-us" },
    openGraph: seo?.image ? { images: [seo.image] } : undefined,
  };
}

export default async function Page() {
  const c = await getContact();

  return (
    <>
      <ImageBanner title={c.title} image={c.banner} crumbs={[{ label: "Contact-Us" }]} />

      <section className="bg-white pt-10 md:pt-14">
        <div className="default-margin">
          <div className="bg-[#f2f2f2] px-5 py-8 md:px-9 md:py-11">
            <h2 className="text-2xl font-medium uppercase text-ink md:text-[28px]">{c.heading}</h2>
            <p className="mt-2 mb-6 flex items-center gap-2 text-xs font-semibold uppercase text-ink">
              <span aria-hidden className="h-px w-9 bg-ink" />
              <span aria-hidden className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-ink" />
                <span className="h-1 w-1 rounded-full bg-ink" />
              </span>
              <span className="ml-2">{c.subheading}</span>
            </p>
            <div className="md:px-2.5">
              <LeadForm form="contact" fields={contactFields} hidden={{ page: "contact-us" }} submitLabel="Submit" />
            </div>
          </div>
        </div>
      </section>

      <ShareThoughts
        title={c.share.title}
        text={c.share.text}
        button={c.share.button}
        bg={c.share.bg}
        formTitle={c.share.formTitle}
        fields={c.share.fields}
      />

      <section className="bg-white py-12">
        <div className="default-margin">
          <Offices regions={c.regions} />
        </div>
      </section>
    </>
  );
}

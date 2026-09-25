import type { Metadata } from "next";
import { ArrowUpRight, FileText, Mail, Phone } from "lucide-react";
import data from "@/content/scraped/contact.json";
import { contactFields } from "@/content/forms";
import { contact, socials } from "@/content/site";
import { EnquireButton } from "@/ui/Enquiry";
import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";
import { SocialIcon, WhatsAppIcon } from "@/ui/Icons";
import PageHero from "@/ui/kit/PageHero";
import Reveal from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import Feedback from "@/ui/Contact/Feedback";
import Offices, { type Region } from "@/ui/Contact/Offices";
import { getDbContact, mergeOffice } from "@/ui/Contact/db";

export const revalidate = 600;

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/contact-us" },
};

const tile =
  "group flex min-h-[132px] flex-col justify-between rounded-[var(--radius-card)] border p-5 text-left no-underline transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]";

export default async function Page() {
  const db = await getDbContact();
  const regions: Region[] = data.regions.map((r) => ({
    ...r,
    cities: r.cities.map((c) => ({ ...c, offices: c.offices.map((o) => mergeOffice(o, db)) })),
  }));
  const hq = regions[0]?.cities[0]?.offices[0];
  const officeCount = regions.reduce((n, r) => n + r.cities.reduce((m, c) => m + c.offices.length, 0), 0);
  const cityCount = regions.reduce((n, r) => n + r.cities.length, 0);

  const actions = [
    { href: contact.phoneHref, icon: Phone, label: "Call us", value: contact.phone },
    { href: `mailto:${contact.email}`, icon: Mail, label: "Email", value: contact.email },
    { href: contact.whatsapp, icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with sales" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Company", href: "/about-us" }, { label: "Contact" }]}
        eyebrow="Contact"
        title="Talk to the people who know the machines."
        description={`Sales, rentals, service or training — reach the right team directly, or visit one of ${officeCount} offices in ${cityCount} cities.`}
        aside={
          <div className="grid grid-cols-2 gap-3">
            {actions.map((a) => (
              <a
                key={a.label}
                href={a.href}
                {...(a.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`${tile} border-line bg-white`}
              >
                <span className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand">
                    <a.icon className="h-[18px] w-[18px]" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-subtle transition-transform duration-500 group-hover:rotate-45 group-hover:text-ink" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[11px] tracking-[0.12em] text-subtle uppercase">{a.label}</span>
                  <span className="mt-1 block truncate text-[15px] font-medium text-ink">{a.value}</span>
                </span>
              </a>
            ))}
            <EnquireButton source="contact-us" className={`${tile} border-transparent bg-brand`}>
              <span className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white">
                  <FileText className="h-[18px] w-[18px]" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink/60 transition-transform duration-500 group-hover:rotate-45 group-hover:text-ink" />
              </span>
              <span>
                <span className="block font-mono text-[11px] tracking-[0.12em] text-ink/60 uppercase">Get a quote</span>
                <span className="mt-1 block text-[15px] font-medium text-ink">Reply in 1 business day</span>
              </span>
            </EnquireButton>
          </div>
        }
      />

      <Section tight className="!pt-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Reveal className="min-w-0 rounded-[var(--radius-panel)] border border-line bg-white p-6 sm:p-10">
            <p className="eyebrow mb-4">Contact form</p>
            <h2 className="display-md">{db?.title ? db.title.charAt(0) + db.title.slice(1).toLowerCase() : "Get in touch with us"}</h2>
            <p className="mt-3 mb-8 text-muted">Tell us what you&apos;re working on and the right specialist will call you back.</p>
            <LeadForm form="contact" fields={contactFields} hidden={{ page: "contact-us" }} submitLabel="Send message" />
          </Reveal>
          <div className="flex min-w-0 flex-col gap-4">
            {hq && (
              <Reveal delay={0.05} className="card p-6">
                <p className="font-mono text-[11px] tracking-[0.12em] text-subtle uppercase">Headquarters</p>
                <h3 className="mt-2 text-xl">
                  {hq.company} · {hq.label}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{hq.address}</p>
                <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                  {hq.phones.map((p) => (
                    <li key={p}>
                      <a href={`tel:${p.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-8 items-center gap-2.5 font-mono text-[13px] text-ink no-underline hover:underline">
                        <Phone className="h-4 w-4 text-muted" /> {p}
                      </a>
                    </li>
                  ))}
                  {hq.emails.map((e) => (
                    <li key={e}>
                      <a href={`mailto:${e}`} className="inline-flex min-h-8 items-center gap-2.5 text-ink no-underline hover:underline">
                        <Mail className="h-4 w-4 text-muted" /> {e}
                      </a>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            <Reveal delay={0.1}>
              <Feedback
                title={data.share.title}
                text={data.share.text}
                button={data.share.button}
                formTitle={data.share.formTitle}
                fields={data.share.fields as FieldDef[]}
              />
            </Reveal>
            <Reveal delay={0.15} className="card p-6">
              <p className="text-sm font-semibold">Follow Mtandt</p>
              <p className="mt-1 text-[13px] text-muted">Project stories, launches and events.</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-ink transition-colors hover:bg-ink hover:text-white"
                    >
                      <SocialIcon name={s.key} className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      <Section id="offices" className="scroll-mt-24">
        <SectionHeader eyebrow="Offices" title="Find us near your site." description="Regional offices, yards and factories across India, Sri Lanka and Qatar." />
        <Offices regions={regions} />
      </Section>
    </>
  );
}

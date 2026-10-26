import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/ui/Icons";

/**
 * Closing call to action shared by the landing pages: a short quote form next to the
 * direct contact options. Anchored at #quote (the hero's "Get a quote" button).
 */
export default function QuoteBand({
  title,
  product,
  page,
  contact,
}: {
  title: string;
  product: string;
  page: string;
  contact: { phone: string; phoneHref: string; email: string; whatsapp: string };
}) {
  const rows = [
    { icon: PhoneIcon, label: "Call us", value: contact.phone, href: contact.phoneHref },
    { icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with our team", href: contact.whatsapp },
    { icon: MailIcon, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
  ];
  return (
    <section id="quote" className="scroll-mt-24 bg-ink py-16 text-white md:py-24">
      <div className="default-margin grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Get a quote</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="mt-4 max-w-md text-white/70">
            Tell us about your site and our team will recommend the right equipment, to buy or rent, usually within one
            working day.
          </p>
          <ul className="mt-8 space-y-3">
            {rows.map(({ icon: Icon, label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  className="group flex items-center gap-4 rounded-md border border-white/10 px-4 py-3 text-white no-underline transition-colors hover:border-brand/60 hover:bg-white/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-ink">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-white/50">{label}</span>
                    <span className="block font-medium text-white">{value}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-white p-6 text-ink shadow-2xl md:p-8 lg:self-center">
          <LeadForm form="enquiry" fields={enquiryFields} hidden={{ product, page }} submitLabel="Request my quote" />
        </div>
      </div>
    </section>
  );
}

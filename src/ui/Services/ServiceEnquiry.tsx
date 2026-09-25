import { Mail, MessageCircle, Phone } from "lucide-react";
import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";
import { contact } from "@/content/site";

/** Mirrors the live "service-Inner-Get-In_touch_form" field set (same names). */
const fields = (service: string): FieldDef[] => [
  { name: "name", label: "Full name", required: true },
  { name: "companyName", label: "Company", required: true },
  { name: "email", label: "Work email", type: "email", required: true },
  { name: "mobile", label: "Mobile number", type: "tel", required: true },
  { name: "designation", label: "Designation" },
  { name: "location", label: "Location", required: true },
  { name: "inquiryFor", label: "Enquiry for", defaultValue: service, full: true },
  { name: "message", label: "Message", type: "textarea", full: true },
];

/** Inline enquiry panel that closes every service / industry page. */
export default function ServiceEnquiry({
  id = "enquire",
  subject,
  eyebrow = "Enquire",
  title,
  text,
  form = "service-enquiry",
  page = "Service",
}: {
  id?: string;
  subject: string;
  eyebrow?: string;
  title?: string;
  text?: string;
  form?: string;
  page?: string;
}) {
  const channels = [
    { icon: Phone, label: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: contact.email, href: `mailto:${contact.email}` },
    { icon: MessageCircle, label: "WhatsApp us", href: contact.whatsapp },
  ];
  return (
    <section id={id} className="scroll-mt-40 py-16 sm:py-24">
      <div className="container-x">
        <div className="grid gap-10 overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:p-14">
          <div className="min-w-0">
            <p className="eyebrow mb-5">{eyebrow}</p>
            <h2 className="display-md">{title ?? `Talk to us about ${subject}.`}</h2>
            <p className="lead mt-5 max-w-md">
              {text ?? "Tell us about your site, team size and timelines — a specialist will reply within one business day."}
            </p>
            <ul className="mt-8 space-y-2">
              {channels.map((c) => (
                <li key={c.href}>
                  <a
                    href={c.href}
                    {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group inline-flex min-h-11 items-center gap-3 text-sm font-medium text-ink no-underline"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas transition-colors group-hover:bg-brand">
                      <c.icon className="h-4 w-4" />
                    </span>
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0">
            <LeadForm form={form} fields={fields(subject)} submitLabel="Send enquiry" hidden={{ service: subject, page }} />
          </div>
        </div>
      </div>
    </section>
  );
}

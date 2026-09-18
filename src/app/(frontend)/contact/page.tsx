import configPromise from "@payload-config";
import { getPayload } from "payload";
import Breadcrumb from "@/ui/Breadcrumb";
import ContactForm from "@/ui/Contact/ContactForm";
import ContactLocations, { type LocationItem } from "@/ui/Contact/ContactLocations";

function richTextToPlainText(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const node = data as { text?: unknown; children?: unknown };
  const parts: string[] = [];

  if (typeof node.text === "string") {
    parts.push(node.text);
  }

  if (Array.isArray(node.children)) {
    parts.push(...node.children.map((child) => richTextToPlainText(child)));
  } else if (node.children && typeof node.children === "object") {
    parts.push(richTextToPlainText(node.children));
  }

  return parts.filter(Boolean).join(" ");
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise });
  const contact = await payload.findGlobal({ slug: "contact" });

  const locations: LocationItem[] = (contact.locations ?? []).map((loc, index) => ({
    id: loc.id ?? String(index),
    title: loc.title ?? null,
    label: loc.label ?? null,
    address: loc.address ?? null,
    addressText: richTextToPlainText(loc.address?.root),
    phones: loc.phones ?? [],
    emails: loc.emails ?? [],
    mapsUrl: loc.maps ?? null,
    city: loc.city ?? null,
    country: loc.country ?? null,
  }));

  return (
    <div>
      <div className="relative flex h-[220px] w-full flex-col overflow-hidden bg-[#d9d9d9]">
        <div className="default-margin relative z-10 pt-4">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact-Us" }]} />
        </div>
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <span className="rounded-full bg-black px-10 py-4 text-lg font-bold tracking-wide text-white uppercase md:text-xl">
            Contact Us
          </span>
        </div>
      </div>

      <div className="bg-[#f5f5f5] py-12">
        <div className="default-margin flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-bold uppercase">{contact.title || "Get in Touch with Us!"}</h2>
            <div className="flex items-center gap-2">
              <span className="h-px w-10 bg-black" />
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              <p className="text-sm font-semibold tracking-wide uppercase">Contact Form</p>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>

      <div className="bg-[#1a1a1a] py-8">
        <div className="default-margin flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="border-l-4 border-primary-yellow pl-4 text-white">
              Your Voice Matters!
            </h3>
            <p className="pl-4 text-white/70">
              Questions, Suggestions, or Complaints? We are listening
            </p>
          </div>
          <a
            href="#contact-form"
            className="bg-primary-yellow px-6 py-3 text-sm font-bold uppercase"
          >
            Share Your Thoughts
          </a>
        </div>
      </div>

      <div className="default-margin pt-8">
        <ContactLocations locations={locations} />
      </div>
    </div>
  );
}

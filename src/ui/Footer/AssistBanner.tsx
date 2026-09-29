import { contact } from "@/content/site";

export default function AssistBanner() {
  return (
    <div className="bg-brand-light">
      <div className="default-margin flex flex-col items-center justify-center gap-1 py-3 text-center sm:flex-row sm:gap-3">
        <p className="text-lg font-medium text-ink-soft">We are here to assist you.</p>
        <a href={contact.phoneHref} className="text-2xl font-bold text-ink no-underline">
          Call us: {contact.phone}
        </a>
      </div>
    </div>
  );
}

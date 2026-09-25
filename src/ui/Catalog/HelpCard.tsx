import { Phone } from "lucide-react";
import { contact } from "@/content/site";
import { EnquireButton } from "@/ui/Enquiry";
import { buttonClass } from "@/ui/kit/Button";

/** Dark "need help choosing?" panel used as a hero aside on catalog pages. */
export default function HelpCard({ stats, subject, source }: { stats: { value: string; label: string }[]; subject?: string; source: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-panel)] bg-graphite text-white">
      <div className="hidden grid-cols-2 gap-px bg-white/10 sm:grid">
        {stats.map((s) => (
          <div key={s.label} className="bg-graphite p-5 sm:p-6">
            <p className="font-mono text-2xl tracking-tight text-white tabular sm:text-3xl">{s.value}</p>
            <p className="mt-1 text-[13px] text-white/55">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-white">Not sure which machine fits?</p>
          <p className="mt-1 text-sm text-white/55">Tell us the height, load and site — we&apos;ll shortlist.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <a href={contact.phoneHref} aria-label={`Call ${contact.phone}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
            <Phone className="h-4 w-4" />
          </a>
          <EnquireButton subject={subject} source={source} className={buttonClass("primary")}>
            Ask an expert
          </EnquireButton>
        </div>
      </div>
    </div>
  );
}

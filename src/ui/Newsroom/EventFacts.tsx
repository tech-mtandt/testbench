import { CalendarDays, CalendarPlus, MapPin, Store } from "lucide-react";
import type { EventItem } from "@/content/media";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import { buttonClass } from "@/ui/kit/Button";
import { eventFacts, fmtRange, isUpcoming } from "./data";

const gcalDate = (iso: string, addDays = 0) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + addDays);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

/** Dates / venue / stall summary with status, thumbnail and actions. */
export default function EventFacts({ e }: { e: EventItem }) {
  const { stall, hall } = eventFacts(e);
  const upcoming = isUpcoming(e);
  const end = e.to && e.from && e.to >= e.from ? e.to : e.from;
  const gcal =
    upcoming && e.from && end
      ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Mtandt at ${e.title}`)}&dates=${gcalDate(e.from)}/${gcalDate(end, 1)}&location=${encodeURIComponent(e.location)}`
      : null;
  const rows = [
    { icon: CalendarDays, label: "Dates", value: fmtRange(e.from, e.to) },
    { icon: MapPin, label: "Venue", value: e.location },
    { icon: Store, label: "Stall", value: [stall, hall && !(stall ?? "").includes(hall) ? `Hall ${hall}` : null].filter(Boolean).join(" · ") },
  ].filter((r) => r.value);

  return (
    <div className={`grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-white ${e.thumb ? "sm:grid-cols-[minmax(0,1fr)_260px]" : ""}`}>
      <div className="p-6 sm:p-7">
        <span
          className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.1em] ${
            upcoming ? "bg-brand text-ink" : "bg-canvas text-muted"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${upcoming ? "bg-ink" : "bg-subtle"}`} />
          {upcoming ? "Upcoming" : "Past event"}
        </span>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className={`flex gap-3 ${r.label === "Venue" ? "sm:col-span-2" : ""}`}>
              <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-subtle">{r.label}</dt>
                <dd className="mt-0.5 text-[15px] font-medium text-ink tabular">{r.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-2">
          <EnquireButton source={`event:${e.slug}`} className={buttonClass(upcoming ? "primary" : "dark", "sm")}>
            {upcoming ? "Book a meeting at the stall" : "Talk to our team"}
          </EnquireButton>
          {gcal && (
            <a href={gcal} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
              <CalendarPlus className="h-4 w-4" /> Add to calendar
            </a>
          )}
        </div>
      </div>
      {e.thumb && (
        <div className="order-first p-3 pb-0 sm:order-none sm:flex sm:items-center sm:p-4 sm:pl-0">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-canvas">
            <Img src={e.thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        </div>
      )}
    </div>
  );
}

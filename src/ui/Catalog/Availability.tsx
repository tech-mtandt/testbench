"use client";

import { ArrowRight, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { contact } from "@/content/site";
import { useEnquiry } from "@/ui/Enquiry";
import { buttonClass } from "@/ui/kit/Button";
import Segmented from "@/ui/kit/Segmented";
import CompareToggle from "./CompareToggle";

type Mode = "buy" | "rent";

const copy: Record<"equipment" | "system", Record<Mode, string>> = {
  equipment: {
    buy: "New, with OEM warranty. AMC, spares and operator training on request.",
    rent: "Daily to multi-year hire — delivered, installed and serviced on site.",
  },
  system: {
    buy: "Designed, supplied and installed by our engineers, with certification and handover training.",
    rent: "Short- or long-term lease with delivery, laying and on-site supervision.",
  },
};

/** Buy/Rent availability + primary actions for a product detail page. `?mode=rent` preselects Rent. */
export default function Availability({
  kind = "equipment",
  modes,
  subject,
  source,
  compare,
}: {
  kind?: "equipment" | "system";
  modes: Mode[];
  subject: string;
  source: string;
  compare: { slug: string; title: string; image: string | null };
}) {
  const [mode, setMode] = useState<Mode>(modes[0] ?? "buy");
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("mode");
    if ((m === "buy" || m === "rent") && modes.includes(m)) setMode(m);
  }, [modes]);
  const { open } = useEnquiry();

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Availability</p>
        {modes.length > 1 ? (
          <Segmented
            ariaLabel="Buy or rent"
            size="sm"
            value={mode}
            onChange={setMode}
            options={[
              { value: "buy", label: "Buy" },
              { value: "rent", label: "Rent" },
            ]}
          />
        ) : (
          <span className="inline-flex h-8 items-center rounded-full bg-ink/5 px-3.5 text-[13px] font-medium text-ink">
            {mode === "buy" ? "Available to buy" : "Available to rent"}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">{copy[kind][mode]}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => open({ subject, source, mode: mode === "buy" ? "Buy" : "Rent" })}
          className={buttonClass("primary", "lg", "flex-1 sm:flex-none")}
        >
          {mode === "rent" ? "Request a rental quote" : "Request a quote"}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
        </button>
        <a href={contact.phoneHref} className={buttonClass("outline", "lg")} aria-label={`Call ${contact.phone}`}>
          <Phone className="h-4 w-4" />
          <span className="max-sm:sr-only">Call</span>
        </a>
        <CompareToggle item={compare} variant="button" />
      </div>
    </div>
  );
}

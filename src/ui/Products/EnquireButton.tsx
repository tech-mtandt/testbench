"use client";

import { useState, useSyncExternalStore } from "react";
import Modal from "@/ui/Modal";
import LeadForm from "@/ui/Forms/LeadForm";
import { enquiryFields } from "@/content/forms";

type Mode = "buy" | "rent";
const NAME: Record<Mode, string> = { buy: "Buy", rent: "Rent" };

const noSubscription = () => () => {};
/** `?for=rent` (rent listings, old rent page addresses) opens the page on Rent. */
const askedForRent = () => new URLSearchParams(window.location.search).get("for") === "rent";

/**
 * The product page's enquiry: a Buy | Rent switch when the machine is available both ways, and
 * the button for the chosen one. The enquiry records which (productType). The choice is kept in
 * the address (?for=rent), so a shared link opens the same way.
 */
export default function EnquireButton({ product, slug, buy, rent }: { product: string; slug: string; buy: boolean; rent: boolean }) {
  const [open, setOpen] = useState(false);
  // On the server (and while hydrating) Buy; the browser then reads the address.
  const fromUrl = useSyncExternalStore(noSubscription, askedForRent, () => false);
  const [picked, setPicked] = useState<Mode | null>(null);
  const both = buy && rent;
  const mode: Mode = !both ? (rent ? "rent" : "buy") : (picked ?? (fromUrl ? "rent" : "buy"));

  const pick = (m: Mode) => {
    setPicked(m);
    const url = new URL(window.location.href);
    if (m === "rent") url.searchParams.set("for", "rent");
    else url.searchParams.delete("for");
    window.history.replaceState(window.history.state, "", url);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {both && (
        <div role="radiogroup" aria-label="Buy or rent" className="inline-flex rounded-full bg-surface p-1 ring-1 ring-black/5">
          {(["buy", "rent"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={m === mode}
              onClick={() => pick(m)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition-colors ${
                m === mode ? "bg-ink text-white shadow" : "text-ink-soft hover:text-ink"
              }`}
            >
              {NAME[m]}
            </button>
          ))}
        </div>
      )}
      <button type="button" onClick={() => setOpen(true)} className="btn-yellow text-xs">
        Enquire to {NAME[mode]}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={mode === "rent" ? "Rental Enquiry" : "Product Enquiry Form"}>
        <p className="mb-4 text-sm text-ink-soft">
          Product: <strong className="text-ink">{product}</strong>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          Looking to: <strong className="text-ink">{NAME[mode]}</strong>
        </p>
        <LeadForm
          key={mode}
          form="productEnquiry"
          fields={enquiryFields}
          columns={1}
          hidden={{ product, productSlug: slug, productType: mode }}
          submitLabel={mode === "rent" ? "Request rental quote" : "Submit"}
        />
      </Modal>
    </div>
  );
}

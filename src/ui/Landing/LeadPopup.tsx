"use client";

import { useEffect, useState } from "react";
import type { FieldDef } from "@/ui/Forms/LeadForm";
import LeadForm from "@/ui/Forms/LeadForm";
import Modal from "@/ui/Modal";

const FIELDS: FieldDef[] = [
  { name: "name", label: "Full Name", required: true },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "companyName", label: "Company Name", required: true },
  { name: "location", label: "Location", required: true },
  { name: "lookingTo", label: "Looking To", type: "select", required: true, options: ["Buy", "Rent", "Other"] },
];

const DELAY_MS = 5000;

/** Lead-capture popup for landing pages: opens once per visit, never again after a submit. */
export default function LeadPopup({ product, page }: { product: string; page: string }) {
  const [open, setOpen] = useState(false);
  const seenKey = `lead-popup-seen:${page}`;
  const doneKey = `lead-popup-done:${page}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(doneKey) || sessionStorage.getItem(seenKey)) return;
    } catch {}
    const t = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(seenKey, "1");
      } catch {}
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [seenKey, doneKey]);

  return (
    <Modal open={open} onClose={() => setOpen(false)} title={`Get the best price on a ${product}`}>
      <p className="mb-4 text-sm text-ink/80">
        Share your details and our team will call you with models, availability and a quote to buy or rent.
      </p>
      <div
        onSubmit={() => {
          try {
            localStorage.setItem(doneKey, "1");
          } catch {}
        }}
      >
        <LeadForm form="landing-popup" fields={FIELDS} hidden={{ product, page }} submitLabel="Get My Quote" />
      </div>
    </Modal>
  );
}

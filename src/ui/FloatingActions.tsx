"use client";

import { useState } from "react";
import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Modal from "@/ui/Modal";
import { WhatsAppIcon } from "@/ui/Icons";

/** Right-edge "Enquire Now" tab + WhatsApp bubble, present on every live page. */
export default function FloatingActions({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* From sm up only: on phones the tab sat mid-screen over text and carousel arrows. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-[40%] z-40 hidden rotate-180 rounded-r bg-brand px-2 py-4 text-sm font-medium text-ink shadow-md [writing-mode:vertical-rl] sm:block"
      >
        Enquire Now
      </button>
      {/* Lifted above the compare bar while it is shown (--compare-bar-h, set by CompareBar). */}
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed right-5 bottom-[max(6rem,calc(var(--compare-bar-h,0px)_+_1rem))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
      <Modal open={open} onClose={() => setOpen(false)} title="Mtandt Get in Touch">
        <LeadForm form="get-in-touch" fields={enquiryFields} columns={1} />
      </Modal>
    </>
  );
}

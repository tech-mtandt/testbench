"use client";

import { useState } from "react";
import { contact } from "@/content/site";
import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Modal from "@/ui/Modal";
import { WhatsAppIcon } from "@/ui/Icons";

/** Right-edge "Enquire Now" tab + WhatsApp bubble, present on every live page. */
export default function FloatingActions() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-[40%] z-40 rotate-180 rounded-r bg-brand px-2 py-4 text-sm font-medium text-ink shadow-md [writing-mode:vertical-rl]"
      >
        Enquire Now
      </button>
      <a
        href={contact.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
      <Modal open={open} onClose={() => setOpen(false)} title="Mtandt Get in Touch" wide>
        <LeadForm form="get-in-touch" fields={enquiryFields} />
      </Modal>
    </>
  );
}

"use client";

import { useState } from "react";
import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Modal from "@/ui/Modal";
import { MailIcon, WhatsAppIcon } from "@/ui/Icons";

/** Right-edge "Enquire Now" tab + WhatsApp bubble, present on every live page. */
export default function FloatingActions({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Side tab from sm up. On phones it covered text and carousel arrows mid-screen, so there
          the enquiry button joins the WhatsApp bubble in the bottom corner instead. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-[40%] z-40 hidden rotate-180 rounded-r bg-brand px-2 py-4 text-sm font-medium text-ink shadow-md [writing-mode:vertical-rl] sm:block"
      >
        Enquire Now
      </button>
      {/* Lifted above the compare bar while it is shown (--compare-bar-h, set by CompareBar). */}
      <div className="fixed right-5 bottom-[max(6rem,calc(var(--compare-bar-h,0px)_+_1rem))] z-40 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Enquire now"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-ink shadow-lg sm:hidden"
        >
          <MailIcon className="h-6 w-6" />
        </button>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg transition-transform hover:scale-105"
        >
          <WhatsAppIcon className="h-8 w-8" />
        </a>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Mtandt Get in Touch" wide>
        <LeadForm form="get-in-touch" fields={enquiryFields} />
      </Modal>
    </>
  );
}

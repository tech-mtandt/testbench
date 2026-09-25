"use client";

import { useState } from "react";
import { subscribeFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Modal from "@/ui/Modal";

export default function SubscribeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="bg-brand py-2 text-sm font-semibold text-ink hover:bg-white">
        Subscribe Now!
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Subscribe Now!" wide>
        <LeadForm form="subscribe" fields={subscribeFields} submitLabel="Subscribe" />
      </Modal>
    </>
  );
}

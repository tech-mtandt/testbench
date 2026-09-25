"use client";

import { useState } from "react";
import Modal from "@/ui/Modal";
import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";

type Props = { title: string; text: string; button: string; bg: string | null; formTitle: string; fields: FieldDef[] };

export default function ShareThoughts({ title, text, button, bg, formTitle, fields }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-3 bg-ink bg-cover bg-center py-10" style={bg ? { backgroundImage: `url("${bg}")` } : undefined}>
      <div className="default-margin flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-white/85">{text}</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="btn-yellow">
          {button}
        </button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={formTitle}>
        <LeadForm form="feedback" fields={fields} columns={1} />
      </Modal>
    </section>
  );
}

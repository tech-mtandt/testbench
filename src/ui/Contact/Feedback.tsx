"use client";

import { ArrowRight, MessageSquareHeart } from "lucide-react";
import { useState } from "react";
import LeadForm, { type FieldDef } from "@/ui/Forms/LeadForm";
import Sheet from "@/ui/kit/Sheet";

type Props = { title: string; text: string; button: string; formTitle: string; fields: FieldDef[] };

/** "Your voice matters" — secondary card that opens the feedback form in a sheet. */
export default function Feedback({ title, text, button, formTitle, fields }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-4 rounded-[var(--radius-card)] bg-graphite p-6 text-left text-white transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-ink">
          <MessageSquareHeart className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">{title}</span>
          <span className="mt-0.5 block text-sm text-white/60">{text}</span>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
            {button} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={formTitle} description="Questions, suggestions or complaints — we read every message.">
        <LeadForm form="feedback" fields={fields} columns={1} submitLabel="Send feedback" />
      </Sheet>
    </>
  );
}

"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { subscribeFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Sheet from "@/ui/kit/Sheet";

export default function SubscribeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white transition-colors hover:border-brand hover:text-brand"
      >
        <Bell className="h-4 w-4" /> Get product & event updates
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Stay in the loop" description="Product launches, events and safety insights. No spam.">
        <LeadForm form="subscribe" fields={subscribeFields} submitLabel="Subscribe" />
      </Sheet>
    </>
  );
}

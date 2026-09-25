"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { enquiryFields } from "@/content/forms";
import LeadForm from "@/ui/Forms/LeadForm";
import Sheet from "@/ui/kit/Sheet";
import { contact } from "@/content/site";

export type EnquiryContext = {
  /** Product / service name shown in the sheet and sent with the lead */
  subject?: string;
  /** Machine-readable source, e.g. "product:scissor-lift-28" */
  source?: string;
  mode?: "Buy" | "Rent" | "Other";
  form?: string;
};

const Ctx = createContext<{ open: (c?: EnquiryContext) => void } | null>(null);

/** One quote/enquiry sheet for the whole site. Call `useEnquiry().open({...})` anywhere. */
export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [ctx, setCtx] = useState<EnquiryContext | null>(null);
  const open = useCallback((c: EnquiryContext = {}) => setCtx(c), []);
  const value = useMemo(() => ({ open }), [open]);

  const fields = useMemo(
    () =>
      enquiryFields.map((f) =>
        f.name === "lookingTo" && ctx?.mode ? { ...f, defaultValue: ctx.mode } : f.name === "message" && ctx?.subject ? { ...f, defaultValue: `I'm interested in ${ctx.subject}.` } : f,
      ),
    [ctx],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet
        open={!!ctx}
        onClose={() => setCtx(null)}
        title={ctx?.subject ? "Request a quote" : "Talk to our team"}
        description={
          ctx?.subject ? (
            <>
              For <span className="font-medium text-ink">{ctx.subject}</span> — we reply within one business day.
            </>
          ) : (
            <>
              Or call <a href={contact.phoneHref} className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4">{contact.phone}</a>
            </>
          )
        }
      >
        {ctx && (
          <LeadForm
            key={JSON.stringify(ctx)}
            form={ctx.form ?? (ctx.subject ? "quote" : "get-in-touch")}
            fields={fields}
            submitLabel="Send request"
            hidden={{ ...(ctx.subject ? { subject: ctx.subject } : {}), ...(ctx.source ? { source: ctx.source } : {}) }}
          />
        )}
      </Sheet>
    </Ctx.Provider>
  );
}

export function useEnquiry() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useEnquiry must be used inside <EnquiryProvider>");
  return c;
}

/** Drop-in client button that opens the quote sheet (usable from server components). */
export function EnquireButton({
  children = "Get a quote",
  className,
  ...ctx
}: EnquiryContext & { children?: ReactNode; className?: string }) {
  const { open } = useEnquiry();
  return (
    <button type="button" className={className} onClick={() => open(ctx)}>
      {children}
    </button>
  );
}

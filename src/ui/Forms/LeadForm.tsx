"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { submitForm, type FormState } from "@/lib/forms";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea" | "file" | "checkbox";
  required?: boolean;
  options?: string[];
  /** Span both columns in the 2-col grid */
  full?: boolean;
  accept?: string;
  /** Pre-filled value (e.g. the product being enquired about) */
  defaultValue?: string;
};

type Props = {
  form: string;
  fields: FieldDef[];
  submitLabel?: string;
  hidden?: Record<string, string>;
  className?: string;
  columns?: 1 | 2;
  dark?: boolean;
};

const labelCls = "mb-1.5 block text-[13px] font-medium";

export default function LeadForm({ form, fields, submitLabel = "Submit", hidden, className = "", columns = 2, dark }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state?.ok ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`flex flex-col items-center rounded-[var(--radius-card)] px-6 py-12 text-center ${dark ? "bg-white/5" : "bg-white"}`}
        >
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <p className={`text-lg font-semibold ${dark ? "text-white" : "text-ink"}`}>Request received</p>
          <p className={`mt-2 max-w-sm text-sm ${dark ? "text-white/60" : "text-muted"}`}>{state.message}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          action={action}
          exit={{ opacity: 0 }}
          className={className}
        >
          <input type="hidden" name="_form" value={form} />
          {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className={`grid gap-x-4 gap-y-5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
            {fields.map((f) => {
              const span = f.full || f.type === "textarea" || f.type === "checkbox" ? "sm:col-span-2" : "";
              const lbl = (
                <span className={`${labelCls} ${dark ? "text-white/80" : "text-ink-2"}`}>
                  {f.label}
                  {f.required && <span className="text-brand-600"> *</span>}
                </span>
              );
              if (f.type === "checkbox") {
                return (
                  <label key={f.name} className={`flex items-start gap-3 text-[13px] leading-relaxed ${dark ? "text-white/60" : "text-muted"} ${span}`}>
                    <input type="checkbox" name={f.name} value="yes" required={f.required} className="mt-0.5 h-4 w-4 accent-ink" />
                    {f.label}
                  </label>
                );
              }
              return (
                <label key={f.name} className={span}>
                  {lbl}
                  {f.type === "select" ? (
                    <select name={f.name} required={f.required} className="field appearance-none" defaultValue={f.defaultValue ?? ""}>
                      <option value="" disabled>
                        Select…
                      </option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea name={f.name} required={f.required} rows={4} defaultValue={f.defaultValue} className="field resize-y" />
                  ) : (
                    <input
                      type={f.type ?? "text"}
                      name={f.name}
                      required={f.required}
                      accept={f.accept}
                      defaultValue={f.defaultValue}
                      className={`field ${f.type === "file" ? "file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-3 file:py-1 file:text-xs file:text-white" : ""}`}
                    />
                  )}
                </label>
              );
            })}
          </div>
          {state && !state.ok && <p className="mt-4 text-sm text-red-600">{state.message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-white transition-colors hover:bg-ink-2 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? "Sending…" : submitLabel}
            {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

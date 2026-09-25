"use client";

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
};

type Props = {
  form: string;
  fields: FieldDef[];
  submitLabel?: string;
  hidden?: Record<string, string>;
  className?: string;
  columns?: 1 | 2;
};

export default function LeadForm({ form, fields, submitLabel = "Submit", hidden, className, columns = 2 }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);

  if (state?.ok) {
    return (
      <div className="rounded border border-brand bg-brand-cream p-6 text-center">
        <p className="font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  const hasFile = fields.some((f) => f.type === "file");

  return (
    <form action={action} className={className} encType={hasFile ? "multipart/form-data" : undefined}>
      <input type="hidden" name="_form" value={form} />
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className={`grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {fields.map((f) => {
          const label = `${f.label}${f.required ? "*" : ""}`;
          const span = f.full || f.type === "textarea" ? "sm:col-span-2" : "";
          if (f.type === "select") {
            return (
              <label key={f.name} className={span}>
                <span className="sr-only">{label}</span>
                <select name={f.name} required={f.required} className="field" defaultValue="">
                  <option value="" disabled>
                    -- {f.label} --
                  </option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            );
          }
          if (f.type === "textarea") {
            return (
              <label key={f.name} className={span}>
                <span className="sr-only">{label}</span>
                <textarea name={f.name} required={f.required} placeholder={label} rows={4} className="field" />
              </label>
            );
          }
          if (f.type === "checkbox") {
            return (
              <label key={f.name} className={`flex items-start gap-2 text-sm text-ink-soft ${span}`}>
                <input type="checkbox" name={f.name} value="yes" required={f.required} className="mt-1" />
                {label}
              </label>
            );
          }
          if (f.type === "file") {
            return (
              <label key={f.name} className={`flex flex-col gap-1 text-sm text-ink-soft ${span}`}>
                {label}
                <input type="file" name={f.name} required={f.required} accept={f.accept} className="field" />
              </label>
            );
          }
          return (
            <label key={f.name} className={span}>
              <span className="sr-only">{label}</span>
              <input
                type={f.type ?? "text"}
                name={f.name}
                required={f.required}
                placeholder={label}
                className="field"
              />
            </label>
          );
        })}
      </div>
      {state && !state.ok && <p className="mt-3 text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-yellow mt-5 disabled:opacity-60">
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

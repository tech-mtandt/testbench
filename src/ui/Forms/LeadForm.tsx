"use client";

import { MAX_TEXT, phoneInput } from "@/lib/form-rules";
import { focusOnMount, useLeadForm } from "./useLeadForm";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "select" | "textarea" | "file" | "checkbox";
  required?: boolean;
  options?: string[];
  /** Span both columns in the 2-col grid */
  full?: boolean;
  accept?: string;
  /** Overrides the browser autofill hint picked from the field name. */
  autoComplete?: string;
};

type Props = {
  form: string;
  fields: FieldDef[];
  submitLabel?: string;
  hidden?: Record<string, string>;
  className?: string;
  columns?: 1 | 2;
};

/** Browser autofill hints for the field names the forms share. */
const AUTOCOMPLETE: Record<string, string> = {
  name: "name",
  fullName: "name",
  firstName: "given-name",
  lastName: "family-name",
  email: "email",
  mobile: "tel",
  phone: "tel",
  companyName: "organization",
  designation: "organization-title",
  location: "address-level2",
};

/** Short example values; the label above each field says what it is. */
const PLACEHOLDER: Partial<Record<NonNullable<FieldDef["type"]>, string>> = {
  email: "name@company.com",
  tel: "98765 43210",
};

export default function LeadForm({ form, fields, submitLabel = "Submit", hidden, className, columns = 2 }: Props) {
  const { state, pending, error, onSubmit } = useLeadForm();

  if (state?.ok) {
    return (
      <div ref={focusOnMount} tabIndex={-1} className="rounded border border-brand bg-brand-cream p-6 text-center outline-none">
        <p className="font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className={className}>
      <input type="hidden" name="_form" value={form} />
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className={`grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {fields.map((f) => {
          const label = `${f.label}${f.required ? "*" : ""}`;
          const span = f.full || f.type === "textarea" ? "sm:col-span-2" : "";
          const caption = <span className="mb-1 block text-sm text-ink-soft">{label}</span>;
          const autoComplete = f.autoComplete ?? AUTOCOMPLETE[f.name];
          if (f.type === "select") {
            return (
              <label key={f.name} className={`block ${span}`}>
                {caption}
                <select name={f.name} required={f.required} className="field" defaultValue="">
                  <option value="" disabled>
                    -- Select --
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
              <label key={f.name} className={`block ${span}`}>
                {caption}
                <textarea name={f.name} required={f.required} maxLength={MAX_TEXT} rows={4} className="field" />
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
            <label key={f.name} className={`block ${span}`}>
              {caption}
              <input
                type={f.type ?? "text"}
                {...(f.type === "tel" ? phoneInput : {})}
                name={f.name}
                required={f.required}
                placeholder={f.type ? PLACEHOLDER[f.type] : undefined}
                autoComplete={autoComplete}
                className="field"
              />
            </label>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-yellow mt-5 disabled:opacity-60">
        {pending ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitForm, type FormState } from "@/lib/forms";
import type { PartnerField, PartnerSection } from "@/content/partner-forms";

const SPAN: Record<number, string> = {
  3: "sm:col-span-6 lg:col-span-3",
  4: "col-span-12 sm:col-span-4",
  6: "sm:col-span-6",
  12: "",
};

function Field({ f, hideLabel }: { f: PartnerField; hideLabel?: boolean }) {
  const label = (
    <span className={hideLabel ? "sr-only" : "mb-1.5 block text-sm text-ink"}>
      {f.label}
      {f.required && " *"}
    </span>
  );

  if (f.type === "file") {
    return (
      <label className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr_1fr] sm:gap-6">
        <span className="text-sm text-ink">
          {f.label}
          {f.required && " *"}
        </span>
        <input type="file" name={f.name} required={f.required} accept={f.accept} className="field py-1.5 text-xs" />
        {f.hint && <span className="text-[11px] text-red-600">{f.hint}</span>}
      </label>
    );
  }
  if (f.type === "radio") {
    return (
      <fieldset>
        <legend className="sr-only">{f.label}</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {f.options?.map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-xs text-ink">
              <input type="radio" name={f.name} value={o} required={f.required} />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  if (f.type === "select") {
    return (
      <label className="block">
        {label}
        <select name={f.name} required={f.required} className="field" defaultValue={f.options?.[0]}>
          {f.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
    );
  }
  if (f.type === "textarea") {
    return (
      <label className="block">
        {label}
        <textarea name={f.name} required={f.required} rows={3} className="field" />
      </label>
    );
  }
  return (
    <label className="block">
      {label}
      <input
        type={f.type ?? "text"}
        name={f.name}
        required={f.required}
        placeholder={/^Year \d$/.test(f.label) ? f.label : undefined}
        inputMode={f.type === "number" ? "numeric" : undefined}
        className="field"
      />
    </label>
  );
}

/** Long, sectioned application form with visible labels (legacy partner forms), posting to the shared form action. */
export default function PartnerForm({ form, title, sections }: { form: string; title: string; sections: PartnerSection[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);
  const [values, setValues] = useState<Record<string, string>>({});

  if (state?.ok) {
    return (
      <div className="border border-brand bg-brand-cream p-8 text-center">
        <p className="font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  const visible = (f: PartnerField) => {
    if (!f.showIf) return true;
    const sel = sections.flatMap((s) => s.fields).find((x) => x.name === f.showIf!.field);
    return (values[f.showIf.field] ?? sel?.options?.[0]) === f.showIf.value;
  };

  return (
    <form
      action={action}
      encType="multipart/form-data"
      onChange={(e) => {
        const t = e.target as unknown as HTMLSelectElement;
        if (t.tagName === "SELECT") setValues((v) => ({ ...v, [t.name]: t.value }));
      }}
      className="bg-[#fcfcfc] px-5 py-8 shadow-[0_5px_15px_rgba(0,0,0,0.35)] sm:px-9 md:py-10"
    >
      <h2 className="mb-8 text-center text-lg font-semibold text-ink">{title}</h2>
      <input type="hidden" name="_form" value={form} />
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {sections.map((s, i) => {
        const radioOnly = s.fields[0]?.type === "radio";
        const files = s.fields.length > 0 && s.fields.every((f) => f.type === "file");
        return (
          <div key={`${s.title}-${i}`} className={s.title && s.level !== 2 ? "mt-7 first:mt-0" : "mt-4 first:mt-0"}>
            {s.title && (
              <h3 className={`mb-4 font-semibold text-ink ${s.level === 2 ? "text-sm" : "text-[15px]"}`}>{s.title}</h3>
            )}
            {files ? (
              <div className="flex flex-col gap-4">
                {s.fields.map((f) => (
                  <Field key={f.name} f={f} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-x-6 gap-y-5">
                {s.fields.filter(visible).map((f, j) => (
                  <div key={f.name} className={`col-span-12 ${SPAN[f.span ?? 12] ?? ""}`}>
                    <Field f={f} hideLabel={radioOnly && j === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <label className="mt-6 flex items-start gap-2 text-xs text-ink-soft">
        <input type="checkbox" name="marketingOptIn" value="yes" defaultChecked className="mt-0.5" />
        <span>
          Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can
          unsubscribe at any time). See{" "}
          <Link href="/pages/privacy-policy" className="font-semibold text-ink">
            privacy policy
          </Link>{" "}
          for more details.
        </span>
      </label>
      {state && !state.ok && <p className="mt-3 text-center text-sm text-red-600">{state.message}</p>}
      <div className="mt-6 text-center">
        <button type="submit" disabled={pending} className="btn-yellow disabled:opacity-60">
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}

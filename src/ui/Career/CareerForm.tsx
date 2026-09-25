"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitForm, type FormState } from "@/lib/forms";

type Props = { functionalAreas: string[]; education: string[] };

const text = (name: string, label: string, type = "text", required = true, id?: string) => ({
  name,
  label,
  type,
  required,
  id,
});

/** Mirrors the live "Interest Form" (#survey-form) incl. radio group + resume upload. */
export default function CareerForm({ functionalAreas, education }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);

  if (state?.ok) {
    return (
      <div className="rounded border border-brand bg-brand-cream p-6 text-center">
        <p className="font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  const before = [
    text("name", "Full Name"),
    text("email", "Email", "email"),
    text("mobile", "Mobile Number", "tel"),
    text("location", "Location"),
  ];
  const after = [
    text("postAppliedFor", "Post Applied for", "text", true, "post_applied_for"),
    text("noticePeriod", "Notice Period"),
    text("currentCtc", "Current CTC"),
    text("expectedCtc", "Expected CTC", "text", false),
  ];
  const input = (f: ReturnType<typeof text>) => (
    <label key={f.name} className="block">
      <span className="mb-1.5 block text-sm text-ink">{f.label}:</span>
      <input
        id={f.id}
        name={f.name}
        type={f.type}
        required={f.required}
        placeholder={`${f.label}*`}
        className="field border-transparent"
      />
    </label>
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_form" value="career" />
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {before.map(input)}
      <label className="block">
        <span className="mb-1.5 block text-sm text-ink">Functional Area*</span>
        <select name="functionalArea" required className="field border-transparent" defaultValue={functionalAreas[0]}>
          {functionalAreas.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-ink">Highest Education Level*</legend>
        <div className="space-y-3">
          {education.map((e) => (
            <label key={e} className="flex items-center gap-3 text-sm text-ink-soft">
              <input type="radio" name="educationLevel" value={e} required />
              {e}
            </label>
          ))}
        </div>
      </fieldset>
      {after.map(input)}
      <label className="block">
        <span className="mb-1.5 block text-sm text-ink">Upload Resume:</span>
        <input
          type="file"
          name="resume"
          required
          accept=".pdf,.doc,.docx"
          className="field border-transparent file:mr-3 file:border file:border-neutral-400 file:bg-neutral-100 file:px-2 file:py-0.5"
        />
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" name="marketingOptIn" value="yes" defaultChecked className="mt-1" />
        <span>
          Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can
          unsubscribe at any time). See{" "}
          <Link href="/pages/privacy-policy" className="font-medium text-ink-soft">
            privacy policy
          </Link>{" "}
          for more details.
        </span>
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <div className="text-center">
        <button type="submit" disabled={pending} className="btn-yellow disabled:opacity-60">
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}

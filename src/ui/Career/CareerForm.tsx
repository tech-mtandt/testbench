"use client";

import Link from "next/link";
import { MAX_FILE_BYTES, formatBytes, phoneInput } from "@/lib/form-rules";
import { focusOnMount, useLeadForm } from "@/ui/Forms/useLeadForm";

type Props = { functionalAreas: string[]; education: string[] };

const text = (name: string, label: string, type = "text", required = true, id?: string, autoComplete?: string) => ({
  name,
  label,
  type,
  required,
  id,
  autoComplete,
});

/** Mirrors the live "Interest Form" (#survey-form) incl. radio group + resume upload. */
export default function CareerForm({ functionalAreas, education }: Props) {
  const { state, pending, error, onSubmit } = useLeadForm();

  if (state?.ok) {
    return (
      <div ref={focusOnMount} tabIndex={-1} className="rounded border border-brand bg-brand-cream p-6 text-center outline-none">
        <p className="font-semibold text-ink">{state.message}</p>
      </div>
    );
  }

  const before = [
    text("name", "Full Name", "text", true, undefined, "name"),
    text("email", "Email", "email", true, undefined, "email"),
    text("mobile", "Mobile Number", "tel", true, undefined, "tel"),
    text("location", "Location", "text", true, undefined, "address-level2"),
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
        {...(f.type === "tel" ? phoneInput : {})}
        required={f.required}
        placeholder={`${f.label}${f.required ? "*" : ""}`}
        autoComplete={f.autoComplete}
        className="field border-transparent"
      />
    </label>
  );

  return (
    <form method="post" onSubmit={onSubmit} className="space-y-5">
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
          data-max-bytes={MAX_FILE_BYTES}
          aria-describedby="resume-hint"
          className="field border-transparent file:mr-3 file:border file:border-neutral-400 file:bg-neutral-100 file:px-2 file:py-0.5"
        />
        <span id="resume-hint" className="mt-1 block text-xs text-ink-soft">
          PDF or Word, up to {formatBytes(MAX_FILE_BYTES)}
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" name="marketingOptIn" value="yes" className="mt-1" />
        <span>
          Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can
          unsubscribe at any time). See{" "}
          <Link href="/pages/privacy-policy" className="font-medium text-ink-soft">
            privacy policy
          </Link>{" "}
          for more details.
        </span>
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="text-center">
        <button type="submit" disabled={pending} className="btn-yellow disabled:opacity-60">
          {pending ? "Sending…" : "Submit"}
        </button>
      </div>
    </form>
  );
}

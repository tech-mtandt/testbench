"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, FileUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { submitForm, type FormState } from "@/lib/forms";

type Props = { functionalAreas: string[]; education: string[] };

/** Fired by the openings list: pre-fills the post (and functional area) and focuses the form. */
export const APPLY_EVENT = "career:apply";
export type ApplyDetail = { post: string; department?: string };

const labelCls = "mb-1.5 block text-[13px] font-medium text-ink-2";
const Req = () => <span className="text-brand-600"> *</span>;

function Text({
  name,
  label,
  type = "text",
  required = true,
  id,
  value,
  onChange,
  autoComplete,
  extra = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  id?: string;
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  extra?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required && <Req />}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        {...(onChange ? { value: value ?? "", onChange: (e) => onChange(e.target.value) } : {})}
        className={`field ${extra}`}
      />
    </label>
  );
}

/** Mirrors the live "Interest Form" (#survey-form) incl. radio group + resume upload. */
export default function CareerForm({ functionalAreas, education }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);
  const [post, setPost] = useState("");
  const [area, setArea] = useState(functionalAreas[0] ?? "");
  const [file, setFile] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<ApplyDetail>).detail;
      setPost(d.post);
      if (d.department && functionalAreas.includes(d.department)) setArea(d.department);
      setFlash(true);
      setTimeout(() => setFlash(false), 1600);
    };
    window.addEventListener(APPLY_EVENT, on);
    return () => window.removeEventListener(APPLY_EVENT, on);
  }, [functionalAreas]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state?.ok ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-[var(--radius-card)] bg-canvas px-6 py-14 text-center"
        >
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <p className="text-lg font-semibold">Application received</p>
          <p className="mt-2 max-w-sm text-sm text-muted">{state.message}</p>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0 }} action={action} className="space-y-8">
          <input type="hidden" name="_form" value="career" />
          <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <fieldset className="space-y-5">
            <legend className="mb-4 font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">01 · About you</legend>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Text name="name" label="Full Name" autoComplete="name" />
              <Text name="email" label="Email" type="email" autoComplete="email" />
              <Text name="mobile" label="Mobile Number" type="tel" autoComplete="tel" />
              <Text name="location" label="Location" />
            </div>
          </fieldset>

          <hr className="border-line" />
          <fieldset className="space-y-5">
            <legend className="mb-4 font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">02 · The role</legend>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              <Text
                name="postAppliedFor"
                id="post_applied_for"
                label="Post Applied for"
                value={post}
                onChange={setPost}
                extra={flash ? "!border-ink !bg-brand/15 duration-700" : "duration-700"}
              />
              <label className="block">
                <span className={labelCls}>
                  Functional Area
                  <Req />
                </span>
                <select name="functionalArea" required value={area} onChange={(e) => setArea(e.target.value)} className="field appearance-none">
                  {functionalAreas.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            </div>
            <div role="radiogroup" aria-required="true" aria-labelledby="edu-label">
              <p id="edu-label" className={labelCls}>
                Highest Education Level
                <Req />
              </p>
              <div className="flex flex-wrap gap-2">
                {education.map((e) => (
                  <label key={e} className="cursor-pointer">
                    <input type="radio" name="educationLevel" value={e} required className="peer sr-only" />
                    <span className="inline-flex h-11 items-center rounded-full border border-line bg-white px-4 text-sm text-ink-2 transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-brand/50 hover:border-ink/40">
                      {e}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-3">
              <Text name="noticePeriod" label="Notice Period" />
              <Text name="currentCtc" label="Current CTC" />
              <Text name="expectedCtc" label="Expected CTC" required={false} />
            </div>
          </fieldset>

          <hr className="border-line" />
          <fieldset>
            <legend className="mb-4 font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">03 · Résumé</legend>
            <label className="group flex cursor-pointer items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 transition-colors hover:border-ink focus-within:border-ink">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-ink ring-1 ring-line transition-colors group-hover:bg-brand">
                {file ? <Check className="h-5 w-5" /> : <FileUp className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">
                  {file ?? (
                    <>
                      Upload Resume
                      <Req />
                    </>
                  )}
                </span>
                <span className="block text-[12px] text-muted">{file ? "Click to replace" : "PDF, DOC or DOCX"}</span>
              </span>
              <input
                type="file"
                name="resume"
                required
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0]?.name ?? null)}
                className="sr-only"
              />
            </label>
          </fieldset>

          <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
            <input type="checkbox" name="marketingOptIn" value="yes" defaultChecked className="mt-0.5 h-4 w-4 accent-ink" />
            <span>
              Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can unsubscribe at
              any time). See{" "}
              <Link href="/pages/privacy-policy" className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4">
                privacy policy
              </Link>{" "}
              for more details.
            </span>
          </label>
          {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-medium text-white transition-colors hover:bg-ink-2 disabled:opacity-60 sm:w-auto sm:px-8"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {pending ? "Sending…" : "Submit application"}
            {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

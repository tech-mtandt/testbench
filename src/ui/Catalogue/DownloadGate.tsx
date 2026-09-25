"use client";

import { motion } from "motion/react";
import { ArrowDownToLine, ArrowRight, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { submitForm, type FormState } from "@/lib/forms";

const fields = [
  { name: "name", label: "Full Name", type: "text", required: true, auto: "name" },
  { name: "email", label: "Email", type: "email", required: true, auto: "email" },
  { name: "mobile", label: "Mobile Number", type: "tel", required: true, auto: "tel" },
  { name: "companyName", label: "Company Name", type: "text", required: false, auto: "organization" },
  { name: "location", label: "Location", type: "text", required: true, auto: "address-level2" },
];

const KEY = "mt-catalogue-unlocked";
export const isUnlocked = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export function DownloadReady({ title, href, again }: { title: string; href: string | null; again?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-12 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-ink">
        <Check className="h-6 w-6" strokeWidth={2.5} />
      </span>
      <p className="text-lg font-semibold">{again ? "Your download is ready" : "Thanks — your catalogue is ready"}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{title}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="group mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-sm font-medium text-white no-underline transition-colors hover:bg-ink-2"
        >
          <ArrowDownToLine className="h-4 w-4 transition-transform group-hover:translate-y-0.5" /> Download PDF
        </a>
      ) : (
        <p className="mt-4 text-sm text-muted">This catalogue isn&apos;t available for download yet. Our team will email it to you.</p>
      )}
    </motion.div>
  );
}

/** Short lead form gating a catalogue PDF; the link is revealed (and opened) once submitted. */
export default function DownloadGate({ title, href }: { title: string; href: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);

  useEffect(() => {
    if (!state?.ok) return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    if (href) window.open(href, "_blank", "noopener");
  }, [state, href]);

  if (state?.ok) return <DownloadReady title={title} href={href} />;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_form" value="catalogue-download" />
      <input type="hidden" name="catalogName" value={title} />
      <input type="hidden" name="filelink" value={href ?? ""} />
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {fields.map((f, i) => (
          <label key={f.name} className={i === 0 ? "sm:col-span-2" : ""}>
            <span className="mb-1.5 block text-[13px] font-medium text-ink-2">
              {f.label}
              {f.required && <span className="text-brand-600"> *</span>}
            </span>
            <input type={f.type} name={f.name} required={f.required} autoComplete={f.auto} className="field" />
          </label>
        ))}
      </div>
      <label className="flex items-start gap-3 text-[13px] leading-relaxed text-muted">
        <input type="checkbox" name="marketingOptIn" value="yes" defaultChecked className="mt-0.5 h-4 w-4 accent-ink" />
        <span>
          Sign up to receive emails from Mtandt Group about products, services, offers, news and events (you can unsubscribe at any
          time). See{" "}
          <Link href="/pages/privacy-policy" className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-ink transition-colors hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownToLine className="h-4 w-4" />}
        {pending ? "Sending…" : "Get the catalogue"}
        {!pending && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </button>
    </form>
  );
}

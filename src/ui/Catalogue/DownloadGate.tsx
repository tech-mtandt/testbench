"use client";

import Link from "next/link";
import { useActionState } from "react";
import { submitForm, type FormState } from "@/lib/forms";
import { DownloadIcon } from "@/ui/Icons";

const fields = [
  { name: "name", label: "Enter Your Full Name", type: "text", required: true },
  { name: "email", label: "Enter Your Email id", type: "email", required: true },
  { name: "companyName", label: "Enter Your Company Name", type: "text", required: false },
  { name: "mobile", label: "Enter Your Mobile Number", type: "tel", required: true },
  { name: "location", label: "Enter Your Location", type: "text", required: true },
];

/** Live gates catalogue PDFs behind a short lead form; the link is revealed once it is submitted. */
export default function DownloadGate({ title, href }: { title: string; href: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitForm, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="font-semibold text-ink">Thank you! Your catalogue is ready.</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" download className="btn-yellow no-underline">
            <DownloadIcon className="h-4 w-4" /> Download {title}
          </a>
        ) : (
          <p className="text-sm text-ink-soft">This catalogue is not available for download yet. Our team will email it to you.</p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="_form" value="catalogue-download" />
      <input type="hidden" name="catalogName" value={title} />
      <input type="hidden" name="filelink" value={href ?? ""} />
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {fields.map((f) => (
        <label key={f.name}>
          <span className="sr-only">{f.label}</span>
          <input
            type={f.type}
            name={f.name}
            required={f.required}
            placeholder={`${f.label}${f.required ? "*" : ""}`}
            className="field"
          />
        </label>
      ))}
      <label className="flex items-start gap-2 text-xs text-ink-soft">
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
      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-yellow self-center disabled:opacity-60">
        {pending ? "Sending…" : "Download"}
      </button>
    </form>
  );
}

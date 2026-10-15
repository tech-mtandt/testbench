"use client";

import Link from "next/link";
import { phoneInput } from "@/lib/form-rules";
import { focusOnMount, useLeadForm } from "@/ui/Forms/useLeadForm";
import { DownloadIcon } from "@/ui/Icons";

const simpleFields = [
  { name: "name", label: "Your Name", type: "text", required: true, autoComplete: "name" },
  { name: "mobile", label: "Phone Number", type: "tel", required: true, autoComplete: "tel" },
  { name: "email", label: "Email (optional)", type: "email", required: false, autoComplete: "email" },
];

const fullFields = [
  { name: "name", label: "Enter Your Full Name", type: "text", required: true, autoComplete: "name" },
  {
    name: "email",
    label: "Enter Your Email id",
    type: "email",
    required: true,
    autoComplete: "email",
  },
  {
    name: "companyName",
    label: "Enter Your Company Name",
    type: "text",
    required: false,
    autoComplete: "organization",
  },
  {
    name: "mobile",
    label: "Enter Your Mobile Number",
    type: "tel",
    required: true,
    autoComplete: "tel",
  },
  {
    name: "location",
    label: "Enter Your Location",
    type: "text",
    required: true,
    autoComplete: "address-level2",
  },
];

/**
 * Gates catalogue PDFs behind a short lead form. The page only knows the catalogue's id:
 * submitForm looks up its PDF and returns the link once the lead is stored.
 */
export default function DownloadGate({
  title,
  catalogue,
  simple,
  page,
}: {
  title: string;
  /** Catalogue id (see getCatalogues); null when there is no PDF to hand out. */
  catalogue: string | null;
  /** Name + phone (+ optional email) only, as on the landing pages. */
  simple?: boolean;
  /** Path the request was sent from. */
  page?: string;
}) {
  const fields = simple ? simpleFields : fullFields;
  const { state, pending, error, onSubmit } = useLeadForm();

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p ref={focusOnMount} tabIndex={-1} className="font-semibold text-ink outline-none">
          {state.download ? "Thank you! Your catalogue is ready." : "Thank you!"}
        </p>
        {state.download ? (
          <a
            href={state.download}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="btn-yellow no-underline"
          >
            <DownloadIcon className="h-4 w-4" /> Download {title}
          </a>
        ) : (
          <p className="text-sm text-ink-soft">
            This catalogue is not available for download yet. Our team will
            email it to you.
          </p>
        )}
      </div>
    );
  }

  return (
    <form method="post" onSubmit={onSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="_form" value="catalogue-download" />
      <input type="hidden" name="_catalogue" value={catalogue ?? ""} />
      <input type="hidden" name="catalogName" value={title} />
      {page && <input type="hidden" name="page" value={page} />}
      <input
        type="text"
        name="_hp"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      {fields.map((f) => (
        <label key={f.name}>
          <span className="sr-only">{f.label}</span>
          <input
            type={f.type}
            {...(f.type === "tel" ? phoneInput : {})}
            name={f.name}
            required={f.required}
            placeholder={`${f.label}${f.required ? "*" : ""}`}
            autoComplete={f.autoComplete}
            className="field"
          />
        </label>
      ))}
      {!simple && (
        <label className="flex items-start gap-2 text-xs text-ink-soft">
          <input
            type="checkbox"
            name="marketingOptIn"
            value="yes"
            className="mt-0.5"
          />
          <span>
            Sign up to receive emails from Mtandt Group about products,
            services, offers, news and events (you can unsubscribe at any time).
            See{" "}
            <Link
              href="/pages/privacy-policy"
              className="font-semibold text-ink"
            >
              privacy policy
            </Link>{" "}
            for more details.
          </span>
        </label>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-yellow self-center disabled:opacity-60"
      >
        {pending ? "Sending…" : "Download"}
      </button>
    </form>
  );
}

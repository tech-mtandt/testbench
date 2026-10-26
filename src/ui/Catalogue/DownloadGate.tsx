"use client";

import { enquiryFields } from "@/content/forms";
import { phoneInput } from "@/lib/form-rules";
import { autoCompleteFor } from "@/ui/Forms/LeadForm";
import { focusOnMount, useLeadForm } from "@/ui/Forms/useLeadForm";
import { DownloadIcon } from "@/ui/Icons";

/**
 * Gates catalogue PDFs behind a short lead form. The page only knows the catalogue's id:
 * submitForm looks up its PDF and returns the link once the lead is stored.
 */
export default function DownloadGate({
  title,
  catalogue,
  page,
}: {
  title: string;
  /** Catalogue id (see getCatalogues); null when there is no PDF to hand out. */
  catalogue: string | null;
  /** Path the request was sent from. */
  page?: string;
}) {
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
            send it to you.
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
      {enquiryFields.map((f) => (
        <label key={f.name}>
          <span className="sr-only">{f.label}</span>
          <input
            type={f.type ?? "text"}
            {...(f.type === "tel" ? phoneInput : {})}
            name={f.name}
            required={f.required}
            placeholder={`${f.label}${f.required ? "*" : ""}`}
            autoComplete={autoCompleteFor(f)}
            className="field"
          />
        </label>
      ))}
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

"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { submitForm, type FormState } from "@/lib/forms";
import { DOCS_EMAIL, FAILED, MAX_FILE_BYTES, MAX_TOTAL_BYTES, formatBytes, tooBig } from "@/lib/form-rules";
import { LEAD_FORMS } from "@/lib/lead-forms";

/** First file over its field's `data-max-bytes` (default 2 MB) or over the total, or null. */
function checkFiles(form: HTMLFormElement): { input: HTMLInputElement; message: string } | null {
  let total = 0;
  let first: HTMLInputElement | null = null;
  for (const input of form.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
    const max = Number(input.dataset.maxBytes) || MAX_FILE_BYTES;
    for (const file of Array.from(input.files ?? [])) {
      if (file.size > max) {
        return { input, message: tooBig(`"${file.name}" is ${formatBytes(file.size)}; the limit is ${formatBytes(max)}.`) };
      }
      total += file.size;
      first ??= input;
    }
  }
  if (first && total > MAX_TOTAL_BYTES) {
    return { input: first, message: tooBig(`Your files add up to ${formatBytes(total)}; the limit is about 4 MB in total.`) };
  }
  return null;
}

declare global {
  interface Window {
    /** Google Tag Manager's data layer (set up in the frontend layout, on the live domain only). */
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * `generate_lead` for a stored lead, pushed to GTM's data layer: which form (`form_name`) and the
 * product, service or brochure it was about (`enquiry_about`). A GA4 event tag in GTM, triggered by
 * this custom event, sends it on to Google Analytics. `enquiry_about` is always set (undefined when
 * there is none) because GTM keeps data layer values from earlier pushes.
 */
function trackLead(data: FormData) {
  const form = String(data.get("_form") || "enquiry");
  if (!LEAD_FORMS.has(form) || data.get("_hp")) return;
  const about = ["product", "service", "catalogName"].map((k) => data.get(k)).find((v) => typeof v === "string" && v);
  window.dataLayer?.push({ event: "generate_lead", form_name: form, enquiry_about: about || undefined });
}

/** Ref for a success message (with tabIndex={-1}): focuses it so screen readers announce it. */
export const focusOnMount = (el: HTMLElement | null) => {
  el?.focus();
};

/**
 * Submit logic shared by the public forms. Posts to submitForm from onSubmit rather than
 * `<form action>`, which resets the form afterwards and so wiped everything typed (and the
 * chosen files) whenever the server answered with an error. Checks file sizes first, turns a
 * failed request (offline, body too large) into a message, and focuses the field a server
 * error is about. `error` is the message to show (role="alert").
 */
export function useLeadForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(async (prev, data) => {
    try {
      const result = await submitForm(prev, data);
      if (result?.ok) trackLead(data);
      return result;
    } catch (err) {
      console.error("[forms] submit failed", err);
      const files = Array.from(data.values()).some((v) => typeof v !== "string" && v.size);
      return { ok: false, message: files ? `${FAILED} You can also email your documents to ${DOCS_EMAIL}.` : FAILED };
    }
  }, null);
  const [problem, setProblem] = useState<string | null>(null);
  const form = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!state || state.ok || !state.field) return;
    const el = form.current?.elements.namedItem(state.field);
    if (el instanceof HTMLElement) el.focus();
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    form.current = e.currentTarget;
    const bad = checkFiles(e.currentTarget);
    setProblem(bad?.message ?? null);
    if (bad) {
      bad.input.focus();
      return;
    }
    const data = new FormData(e.currentTarget);
    // Every lead says where it was sent from: the page (unless the form names it) and its full
    // address, with any campaign parameters.
    if (LEAD_FORMS.has(String(data.get("_form")))) {
      if (!data.get("page")) data.set("page", window.location.pathname);
      if (!data.get("pageUrl")) data.set("pageUrl", window.location.href);
    }
    startTransition(() => action(data));
  };

  const error = pending ? null : (problem ?? (state && !state.ok ? state.message : null));
  return { state, pending, error, onSubmit };
}

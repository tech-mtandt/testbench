"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { submitForm, type FormState } from "@/lib/forms";
import { DOCS_EMAIL, FAILED, MAX_FILE_BYTES, MAX_TOTAL_BYTES, formatBytes, tooBig } from "@/lib/form-rules";

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
      return await submitForm(prev, data);
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
    startTransition(() => action(data));
  };

  const error = pending ? null : (problem ?? (state && !state.ok ? state.message : null));
  return { state, pending, error, onSubmit };
}

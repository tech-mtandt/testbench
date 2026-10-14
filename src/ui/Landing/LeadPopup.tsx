"use client";

import { useActionState, useEffect, useState } from "react";
import { submitForm, type FormState } from "@/lib/forms";
import Modal from "@/ui/Modal";

const DELAY_MS = 5000;

/**
 * Lead-capture popup for landing pages: name + phone (email optional). Opens once per
 * visit and never again after a submit. Sends the page path and full URL (with any
 * campaign parameters) so each lead shows where it came from.
 */
export default function LeadPopup({
  product,
  page,
}: {
  product: string;
  page: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(
    submitForm,
    null,
  );
  const seenKey = `lead-popup-seen:${page}`;
  const doneKey = `lead-popup-done:${page}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(doneKey) || sessionStorage.getItem(seenKey))
        return;
    } catch {}
    const t = setTimeout(() => {
      setUrl(window.location.href);
      setOpen(true);
      try {
        sessionStorage.setItem(seenKey, "1");
      } catch {}
    }, DELAY_MS);
    return () => clearTimeout(t);
  }, [seenKey, doneKey]);

  useEffect(() => {
    if (!state?.ok) return;
    try {
      localStorage.setItem(doneKey, "1");
    } catch {}
  }, [state, doneKey]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title={`Get a ${product} quote`}
    >
      {state?.ok ? (
        <p className="py-4 text-center font-semibold text-ink">
          {state.message}
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <p className="text-sm text-ink/80">
            Leave your number and our team will call you back with prices and
            availability.
          </p>
          <input type="hidden" name="_form" value="landing-popup" />
          <input type="hidden" name="product" value={product} />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="pageUrl" value={url} />
          <input
            type="text"
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden
          />
          <input
            name="name"
            required
            placeholder="Your Name*"
            autoComplete="name"
            className="field"
          />
          <input
            name="mobile"
            type="tel"
            required
            placeholder="Phone Number*"
            autoComplete="tel"
            className="field"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            autoComplete="email"
            className="field"
          />
          {state && !state.ok && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="btn-yellow disabled:opacity-60"
          >
            {pending ? "Sending…" : "Call Me Back"}
          </button>
        </form>
      )}
    </Modal>
  );
}

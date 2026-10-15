"use client";

import { useEffect, useState } from "react";
import { phoneInput } from "@/lib/form-rules";
import { focusOnMount, useLeadForm } from "@/ui/Forms/useLeadForm";
import Modal from "@/ui/Modal";

const DELAY_MS = 5000;
/** While the visitor is busy elsewhere, ask again after this long. */
const RETRY_MS = 4000;

/** Typing in another form, or another dialog (enquiry, brochure…) is open: don't interrupt. */
function busy() {
  const el = document.activeElement;
  const typing = el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
  return typing || Boolean(document.querySelector("dialog[open]"));
}

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
  const { state, pending, error, onSubmit } = useLeadForm();
  const seenKey = `lead-popup-seen:${page}`;
  const doneKey = `lead-popup-done:${page}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(doneKey) || sessionStorage.getItem(seenKey))
        return;
    } catch {}
    let t: ReturnType<typeof setTimeout>;
    const show = () => {
      if (busy()) {
        t = setTimeout(show, RETRY_MS);
        return;
      }
      setUrl(window.location.href);
      setOpen(true);
      try {
        sessionStorage.setItem(seenKey, "1");
      } catch {}
    };
    t = setTimeout(show, DELAY_MS);
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
        <p
          ref={focusOnMount}
          tabIndex={-1}
          className="py-4 text-center font-semibold text-ink outline-none"
        >
          {state.message}
        </p>
      ) : (
        <form method="post" onSubmit={onSubmit} className="flex flex-col gap-3">
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
            aria-label="Your Name"
            autoComplete="name"
            className="field"
          />
          <input
            name="mobile"
            type="tel"
            {...phoneInput}
            required
            placeholder="Phone Number*"
            aria-label="Phone Number"
            autoComplete="tel"
            className="field"
          />
          <input
            name="email"
            type="email"
            placeholder="Email (optional)"
            aria-label="Email (optional)"
            autoComplete="email"
            className="field"
          />
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
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

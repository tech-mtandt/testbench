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

/** Shown once per browser session; never again in this browser after a submit. */
const SEEN_KEY = "lead-popup-seen";
const DONE_KEY = "lead-popup-done";

/** The machine or range the current page is about, if it names one (see QuoteProduct). */
const pageProduct = () => document.querySelector<HTMLElement>("[data-quote-product]")?.dataset.quoteProduct || null;

/**
 * Site-wide lead-capture popup (in the frontend layout): name + phone (email optional), the
 * field set every enquiry form uses (see enquiryFields). Opens a few seconds into the first page
 * of a visit, once per browser session, and never again after a submit. Its heading and the
 * lead name the product of the page it opens on; like every enquiry, it sends that page and its
 * full URL (see useLeadForm).
 */
export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<string | null>(null);
  const { state, pending, error, onSubmit } = useLeadForm();

  useEffect(() => {
    try {
      if (localStorage.getItem(DONE_KEY) || sessionStorage.getItem(SEEN_KEY)) return;
    } catch {}
    let t: ReturnType<typeof setTimeout>;
    const show = () => {
      if (busy()) {
        t = setTimeout(show, RETRY_MS);
        return;
      }
      setProduct(pageProduct());
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
    };
    t = setTimeout(show, DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!state?.ok) return;
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {}
  }, [state]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title={product ? `Get ${/^[aeiou]/i.test(product) ? "an" : "a"} ${product} quote` : "Get a quote"}
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
          {product && <input type="hidden" name="product" value={product} />}
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

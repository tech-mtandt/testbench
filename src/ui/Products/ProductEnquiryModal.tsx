"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ProductEnquiryModal({
  productTitle,
  triggerClassName,
  triggerLabel = "Enquire Now",
}: {
  productTitle: string;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const inputClass =
    "w-full border border-black/20 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 focus:border-primary-yellow focus:outline-none";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsOpen(false);
  }

  const modal = (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-black px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Product Enquiry Form</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="text-2xl leading-none text-white hover:text-primary-yellow"
          >
            &times;
          </button>
        </div>

        <form
          id="product-enquiry-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 overflow-y-auto px-6 py-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="text" defaultValue={productTitle} readOnly className={inputClass} />
            <input
              type="text"
              placeholder="Enter Your Full Name*"
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Enter Company Name*"
              required
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Enter Your Email Id*"
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Enter Your Designation*"
              required
              className={inputClass}
            />
            <input type="tel" placeholder="Enter Your Mobile Number" className={inputClass} />
          </div>

          <input type="text" placeholder="Enter Your Location*" required className={inputClass} />

          <textarea
            placeholder="Please Mention The Application, Duration And Quantity Required In The Section Below"
            rows={3}
            className={`${inputClass} resize-none`}
          />

          <label className="flex items-start gap-2 text-xs text-black/70">
            <input
              type="checkbox"
              defaultChecked
              className="mt-1 h-4 w-4 shrink-0 accent-primary-yellow"
            />
            <span>
              Sign up to receive emails from Mtandt Group about products, services, offers, news
              and events (you can unsubscribe at any time). See{" "}
              <Link href="/privacy-policy" className="underline">
                privacy policy
              </Link>{" "}
              for more details.
            </span>
          </label>
        </form>

        <div className="flex justify-center bg-black px-6 py-4">
          <button
            type="submit"
            form="product-enquiry-form"
            className="bg-primary-yellow px-10 py-3 text-sm font-bold uppercase"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      {isOpen ? createPortal(modal, document.body) : null}
    </>
  );
}

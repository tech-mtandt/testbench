"use client";

import Link from "next/link";
import { useEffect } from "react";
import { CALL_US, DOCS_EMAIL } from "@/lib/form-rules";

/** Any unexpected error on a page: the site chrome stays, with a retry and a way to reach us. */
export default function FrontendError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="default-margin flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">Something went wrong</p>
      <h1 className="text-2xl font-semibold text-ink md:text-3xl">Sorry, this page ran into a problem</h1>
      <p className="max-w-xl text-ink-soft">
        Please try again. If you were sending us a form and it did not go through, call us on{" "}
        <a href={`tel:${CALL_US.replace(/\s/g, "")}`} className="font-semibold text-ink">
          {CALL_US}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${DOCS_EMAIL}`} className="font-semibold text-ink">
          {DOCS_EMAIL}
        </a>{" "}
        and our team will help you right away.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => unstable_retry()} className="btn-yellow">
          Try again
        </button>
        <a href={`tel:${CALL_US.replace(/\s/g, "")}`} className="btn-dark no-underline">
          Call {CALL_US}
        </a>
        <Link href="/contact-us" className="btn-dark no-underline">
          Contact us
        </Link>
      </div>
      {error.digest && <p className="text-xs text-neutral-400">Reference: {error.digest}</p>}
    </section>
  );
}

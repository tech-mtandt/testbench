"use client";

import { useLenis } from "lenis/react";

export default function BackToTopButton() {
  const lenis = useLenis();

  return (
    <button
      type="button"
      onClick={() => {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.5 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      aria-label="Back to top"
      className="absolute -top-6 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-black"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

"use client";

/** Prefills "Post Applied for" and scrolls to the interest form, like the live autofillcarrer(). */
export default function ApplyButton({ post }: { post: string }) {
  return (
    <button
      type="button"
      className="btn-dark mt-2"
      onClick={() => {
        const el = document.getElementById("post_applied_for") as HTMLInputElement | null;
        if (!el) return;
        el.value = post;
        document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
        el.focus({ preventScroll: true });
      }}
    >
      Apply
    </button>
  );
}

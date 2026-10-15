import type { Faq } from "@/content/products";
import Faqs from "@/ui/Products/Faqs";

/**
 * About + FAQs, side by side. Long write-ups show their opening and fold the rest behind
 * "Read more" (still in the page for search engines).
 */
export default function AboutFaq({ title, html, faqs }: { title: string; html: string; faqs: Faq[] }) {
  if (!html && !faqs.length) return null;
  // Split the write-up after its first paragraph-ish block so the page opens short.
  const parts = html.split(/(?<=<\/p>|<br\s*\/?>\s*<br\s*\/?>)/i);
  const lead = parts.length > 1 ? parts[0] : html;
  const rest = parts.length > 1 ? parts.slice(1).join("") : "";
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className={`default-margin grid gap-10 ${faqs.length && html ? "lg:grid-cols-2 lg:gap-16" : ""}`}>
        {html && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft">About</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h2>
            <div className="prose-legacy mt-6 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: lead }} />
            {rest.trim() && (
              <details className="group mt-2">
                <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Read more</span>
                  <span className="hidden group-open:inline">Show less</span>
                </summary>
                <div className="prose-legacy mt-4 text-[15px] leading-relaxed" dangerouslySetInnerHTML={{ __html: rest }} />
              </details>
            )}
          </div>
        )}
        {faqs.length > 0 && (
          <div className="overflow-hidden rounded-md bg-white ring-1 ring-black/5">
            <Faqs items={faqs} title="Questions, answered" />
          </div>
        )}
      </div>
    </section>
  );
}

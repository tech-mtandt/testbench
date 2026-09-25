import type { Subcategory } from "@/content/products";
import { cleanHtml } from "@/content/catalog-view";
import Accordion from "@/ui/kit/Accordion";
import Tabs from "@/ui/kit/Tabs";

function Panel({ sub }: { sub: Subcategory }) {
  const html = cleanHtml(sub.html);
  return (
    <div className={`grid grid-cols-1 gap-10 ${sub.faqs.length ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16" : ""}`}>
      {html && <div className="prose-mt max-w-2xl" dangerouslySetInnerHTML={{ __html: html }} />}
      {sub.faqs.length > 0 && (
        <div className="min-w-0">
          <p className="eyebrow mb-4">Frequently asked</p>
          <Accordion
            items={sub.faqs.map((f, i) => ({
              id: `${sub.slug}-${i}`,
              title: f.q,
              content: <div className="prose-mt text-[15px]" dangerouslySetInnerHTML={{ __html: cleanHtml(f.a) }} />,
            }))}
          />
        </div>
      )}
    </div>
  );
}

/** Buying guide: one tab per product line with its overview copy and FAQs. */
export default function SubGuide({ subs, initial }: { subs: Subcategory[]; initial?: string | null }) {
  const withCopy = subs.filter((s) => s.html || s.faqs.length);
  if (!withCopy.length) return null;
  if (withCopy.length === 1) return <Panel sub={withCopy[0]} />;
  const start = withCopy.some((s) => s.slug === initial) ? initial! : withCopy[0].slug;
  return <Tabs key={start} initial={start} items={withCopy.map((s) => ({ id: s.slug, label: s.name, content: <Panel sub={s} /> }))} />;
}

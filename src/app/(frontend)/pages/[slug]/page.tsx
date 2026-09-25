import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import legal from "@/content/scraped/legal.json";
import { contact } from "@/content/site";
import PageHero from "@/ui/kit/PageHero";
import LegalToc from "@/ui/Company/LegalToc";
import { legalDoc } from "@/ui/Company/lib";

type Params = { params: Promise<{ slug: string }> };
type LegalPage = { meta: { title: string; description: string }; title: string; crumb: string; html: string };
const pages = legal as Record<string, LegalPage>;

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) return {};
  return { title: p.meta.title, description: p.meta.description, alternates: { canonical: `/pages/${slug}` } };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const p = pages[slug];
  if (!p) notFound();
  const doc = legalDoc(p.html);
  const toc = [{ id: "introduction", label: "Introduction" }, ...doc.toc];
  const others = Object.entries(pages).filter(([s]) => s !== slug);

  return (
    <>
      <PageHero
        crumbs={[{ label: "Legal" }, { label: p.crumb }]}
        eyebrow="Legal"
        title={p.title}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-muted">
            {doc.approved && <span>Approved by the Board · {doc.approved}</span>}
            {doc.approved && <span aria-hidden>·</span>}
            <span>{doc.minutes} min read</span>
            <span aria-hidden>·</span>
            <span>{doc.toc.length} sections</span>
          </span>
        }
      />

      <div className="container-x pb-20 sm:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
          <aside className="min-w-0">
            <details className="card group p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium [&::-webkit-details-marker]:hidden">
                Contents <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <ol className="mt-3 space-y-1 border-t border-line pt-3">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="block py-1.5 text-[13px] text-muted no-underline hover:text-ink">
                      {t.label}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
            <div className="hidden lg:sticky lg:top-32 lg:block">
              <LegalToc items={toc} />
              {others.length > 0 && (
                <div className="mt-8 border-t border-line pt-6">
                  <p className="mb-2 font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">Also read</p>
                  {others.map(([s, o]) => (
                    <Link key={s} href={`/pages/${s}`} className="group flex items-center justify-between py-1.5 text-[13px] text-ink no-underline">
                      {o.title} <ArrowRight className="h-3.5 w-3.5 opacity-40 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <article className="min-w-0 rounded-[var(--radius-panel)] border border-line bg-white p-6 sm:p-10 lg:p-14">
            <span id="introduction" className="block scroll-mt-32" />
            <div
              className="prose-mt max-w-[72ch] [&_h2]:scroll-mt-32 [&_h3]:scroll-mt-32 [&_h3]:text-base [&_h2]:border-t [&_h2]:border-line [&_h2]:pt-8 [&_h2]:text-xl [&_h2:first-of-type]:mt-12"
              dangerouslySetInnerHTML={{ __html: doc.body }}
            />
            <div className="mt-12 flex flex-col gap-4 rounded-[var(--radius-card)] bg-canvas p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">Questions about this policy?</p>
                <p className="mt-0.5 text-[13px] text-muted">Write to us and we&apos;ll get back to you.</p>
              </div>
              <a href={`mailto:${contact.email}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-white no-underline hover:bg-ink-2">
                <Mail className="h-4 w-4" /> {contact.email}
              </a>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

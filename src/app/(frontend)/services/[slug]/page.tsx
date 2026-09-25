import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getService, listServices, serviceSlugs } from "@/content/services";
import ServicePage from "@/ui/Services/ServicePage";
import { duplicateServices, families, familyOf, hubData, indexEntry, titleCase, toCards } from "@/ui/Services/model";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

function displayTitle(slug: string, fallback: string) {
  const idx = indexEntry(slug);
  // Prefer the proper-cased index title; DB / legacy headings are often upper-case.
  return titleCase(fallback !== fallback.toUpperCase() ? fallback : idx?.title ?? fallback);
}

/** Hero lead: the hub's card copy for this service, else a complete index excerpt. */
function heroLead(slug: string): string | null {
  const fromHub = families
    .flatMap((f) => hubData(f.slug).services.items)
    .find((it) => it.href?.endsWith(`/${slug}`))?.text;
  if (fromHub) return fromHub;
  const idx = indexEntry(slug);
  if (!idx || idx.excerpt.length < 40 || idx.excerpt.toLowerCase() === idx.title.toLowerCase()) return null;
  const t = idx.excerpt.trim();
  // Legacy excerpts are hard-truncated mid-word; end them cleanly.
  return /[.!?]$/.test(t) ? t : `${t.slice(0, t.lastIndexOf(" "))}…`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return {
    title: { absolute: s.scraped.meta.title || `${displayTitle(slug, s.title)} | Mtandt` },
    description: s.scraped.meta.description,
    alternates: { canonical: `/services/${duplicateServices[slug] ?? slug}` },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  if (duplicateServices[slug]) permanentRedirect(`/services/${duplicateServices[slug]}`);
  const s = await getService(slug);
  if (!s) notFound();

  const cards = toCards(await listServices());
  const family = familyOf(slug);
  const title = s.scraped.kind === "hub" ? family?.title ?? s.title : displayTitle(slug, s.title);
  const excerpt = heroLead(slug);

  return <ServicePage s={s} title={title} excerpt={s.scraped.kind === "detail" ? excerpt : null} cards={cards} />;
}

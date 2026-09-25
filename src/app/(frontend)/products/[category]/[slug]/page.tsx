import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, FileDown } from "lucide-react";
import { catalog, getItem, getItemByLegacySlug, productHref, relatedItems } from "@/content/catalog";
import { getCategory } from "@/content/products";
import {
  categoryLabel,
  cleanHtml,
  fmtSpec,
  heroSpecs,
  itemFacetLabels,
  sentenceCase,
  toCard,
} from "@/content/catalog-view";
import { EnquireButton } from "@/ui/Enquiry";
import Img from "@/ui/Img";
import Accordion from "@/ui/kit/Accordion";
import { Button, buttonClass } from "@/ui/kit/Button";
import Marquee from "@/ui/kit/Marquee";
import { Breadcrumbs } from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import Availability from "@/ui/Catalog/Availability";
import Gallery from "@/ui/Catalog/Gallery";
import ProductCard from "@/ui/Catalog/ProductCard";
import SectionNav from "@/ui/Catalog/SectionNav";
import Showcase from "@/ui/Catalog/Showcase";

type Props = { params: Promise<{ category: string; slug: string }> };

export const generateStaticParams = () => catalog.map((i) => ({ category: i.category, slug: i.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const it = getItem(slug);
  if (!it) return {};
  const title = it.meta.title || `${it.title}${it.model ? ` ${it.model}` : ""} — ${it.modes.includes("rent") ? "buy or rent" : "buy"}`;
  return {
    title: { absolute: it.meta.title ? it.meta.title : `${title} | Mtandt` },
    description: it.meta.description || it.summary,
    keywords: it.meta.keywords || undefined,
    alternates: { canonical: productHref(it) },
    openGraph: { title, description: it.meta.description || it.summary, images: it.image ? [it.image] : undefined },
  };
}

function Block({ id, eyebrow, title, children, aside }: { id: string; eyebrow: string; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-36 border-t border-line py-14 first:border-t-0 sm:py-20">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <Reveal className="lg:sticky lg:top-40 lg:self-start">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="display-md">{title}</h2>
          {aside}
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default async function Page({ params }: Props) {
  const { category, slug } = await params;
  const it = getItem(slug);
  if (!it) {
    const legacy = getItemByLegacySlug(slug);
    if (legacy) permanentRedirect(productHref(legacy));
    notFound();
  }
  if (it.category !== category) permanentRedirect(productHref(it));

  const system = it.kind === "system";
  const cat = getCategory(it.category);
  const sub = cat?.subcategories.find((s) => s.slug === it.subcategory) ?? null;
  const catName = categoryLabel(it.category);
  const subject = `${it.title}${it.model ? ` (${it.model})` : ""}`;
  const strip = heroSpecs(it);
  const specs = it.specs.filter(([, v]) => v).map(fmtSpec);
  const industries = itemFacetLabels(it, "industry");
  const description = cleanHtml(it.descriptionHtml);
  const features = [
    { title: "Standard features", html: cleanHtml(it.featuresHtml) },
    { title: "Options", html: cleanHtml(it.optionsHtml) },
    { title: "Benefits", html: cleanHtml(it.benefitsHtml) },
  ].filter((f) => f.html);
  const showcase = it.showcase?.items.length ? it.showcase : null;
  const galleryImages = system ? [] : it.gallery.slice(1);
  // relatedItems() can repeat a slug when the source "related" list has duplicates
  const related = [...new Map(relatedItems(it, 12).map((r) => [r.slug, r])).values()].slice(0, 8).map(toCard);
  const faqs = sub?.faqs ?? [];

  const nav = [
    { id: "overview", label: "Overview" },
    specs.length ? { id: "specifications", label: "Specifications" } : null,
    features.length ? { id: "features", label: "Features" } : null,
    it.applications.length || industries.length || it.journey.length ? { id: "applications", label: system ? "How it works" : "Applications" } : null,
    it.downloads.length ? { id: "downloads", label: "Downloads" } : null,
    showcase || galleryImages.length > 0 ? { id: "gallery", label: system ? "Projects" : "Gallery" } : null,
    faqs.length ? { id: "faq", label: "FAQ" } : null,
  ].filter((x): x is { id: string; label: string } => !!x);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: it.title,
    ...(it.model ? { model: it.model, sku: it.model } : {}),
    description: it.summary,
    image: it.gallery.length ? it.gallery : undefined,
    category: `${catName} / ${it.subcategoryName}`,
    brand: { "@type": "Brand", name: itemFacetLabels(it, "brand")[0] ?? "Mtandt" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="pt-28 pb-12 sm:pt-32 sm:pb-16">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { label: "Equipment", href: "/products" },
              { label: catName, href: `/products/${it.category}` },
              ...(sub && !system ? [{ label: sub.name, href: `/products/${it.category}?sub=${sub.slug}` }] : []),
              { label: it.model || it.title },
            ]}
          />
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
            <Gallery images={it.gallery.length ? it.gallery : it.image ? [it.image] : []} title={it.title} slug={it.slug} photo={system} />
            <Reveal className="flex min-w-0 flex-col">
              <p className="eyebrow">{system ? catName : `${it.subcategoryName} · ${catName}`}</p>
              <h1 className="mt-5 text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.04em]">{it.title}</h1>
              {it.model && (
                <p className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-white px-3 py-1 font-mono text-[13px] text-ink-2">
                  <span className="text-subtle">Model</span> {it.model}
                </p>
              )}
              {it.summary && <p className="lead mt-5 line-clamp-4">{it.summary}</p>}

              {strip.length > 0 && (
                <dl
                  className={`mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line ${
                    system || strip.some((x) => x.value.length > 12) ? "" : "sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4"
                  }`}
                >
                  {strip.map((s) => (
                    <div key={s.label} className="min-w-0 bg-white p-4">
                      <dt className="truncate text-[12px] text-muted" title={s.label}>
                        {s.label}
                      </dt>
                      <dd className="mt-1 font-mono text-base tracking-tight break-words text-ink tabular sm:text-lg" title={s.value}>
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-4">
                <Availability kind={it.kind} modes={it.modes} subject={subject} source={`product:${it.slug}`} compare={{ slug: it.slug, title: it.title, image: it.image }} />
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <SectionNav
        items={nav}
        cta={
          <EnquireButton subject={subject} source={`product:${it.slug}:nav`} className={buttonClass("primary", "sm")}>
            Request a quote
          </EnquireButton>
        }
      />

      <div className="container-x">
        <Block id="overview" eyebrow="Overview" title={system ? `About ${it.title}` : "Built for the job"}>
          {description ? <div className="prose-mt max-w-none" dangerouslySetInnerHTML={{ __html: description }} /> : <p className="text-muted">{it.summary}</p>}
          {it.charts.length > 0 && !specs.length && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {it.charts.map((c) => (
                <Img key={c} src={c} alt={`${it.title} load chart`} className="w-full rounded-[var(--radius-card)] border border-line bg-white p-4" />
              ))}
            </div>
          )}
        </Block>

        {specs.length > 0 && (
          <Block
            id="specifications"
            eyebrow="Specifications"
            title="The numbers"
            aside={
              <p className="mt-4 max-w-sm text-sm text-muted">
                Figures are manufacturer specifications. Need a site-specific recommendation?{" "}
                <EnquireButton subject={subject} source={`product:${it.slug}:specs`} className="font-medium text-ink underline decoration-brand decoration-2 underline-offset-4">
                  Ask an engineer
                </EnquireButton>
              </p>
            }
          >
            <dl className="border-t border-line">
              {specs.map((s, i) => (
                <div key={`${s.label}-${i}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-line py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                  <dt className="text-sm text-muted">{s.label}</dt>
                  <dd className="font-mono text-sm break-words text-ink tabular">{s.value}</dd>
                </div>
              ))}
            </dl>
            {it.charts.length > 0 && (
              <div className="mt-10">
                <p className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Load & working-range charts</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {it.charts.map((c) => (
                    <a key={c} href={c} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-[var(--radius-card)] border border-line bg-white p-4">
                      <Img src={c} alt={`${it.title} chart`} className="w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Block>
        )}

        {features.length > 0 && (
          <Block id="features" eyebrow="Features" title={features.length > 1 ? "What's included" : features[0].title}>
            <div className={`grid grid-cols-1 gap-4 ${features.length > 1 ? "md:grid-cols-2" : ""}`}>
              {features.map((f) => (
                <div key={f.title} className={`card p-6 sm:p-7 ${features.length === 3 && f.title === "Standard features" ? "md:col-span-2" : ""}`}>
                  {features.length > 1 && <h3 className="mb-4 text-lg">{f.title}</h3>}
                  <div className="prose-mt [&>ul]:mb-0" dangerouslySetInnerHTML={{ __html: f.html }} />
                </div>
              ))}
            </div>
          </Block>
        )}

        {(it.applications.length > 0 || industries.length > 0 || it.journey.length > 0) && (
          <Block id="applications" eyebrow={system ? "How it works" : "Applications"} title={system && it.journey.length ? "From survey to installation" : "Where it works"}>
            {it.journey.length > 0 && (
              <Stagger className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
                {it.journey.map((j, i) => (
                  <StaggerItem key={j.title} className="bg-white p-6 sm:p-7">
                    <p className="font-mono text-xs text-subtle tabular">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-4 text-lg">{sentenceCase(j.title)}</h3>
                    <div className="prose-mt mt-2 text-sm [&_ul]:mb-0" dangerouslySetInnerHTML={{ __html: cleanHtml(j.html) }} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
            {it.applications.length > 0 && (
              <div className={it.journey.length ? "mt-10" : ""}>
                <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Tasks</p>
                <ul className="flex flex-wrap gap-2">
                  {it.applications.map((a) => (
                    <li key={a} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] text-ink-2">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {industries.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Industries</p>
                <ul className="flex flex-wrap gap-2">
                  {industries.map((a) => (
                    <li key={a} className="rounded-full bg-ink/5 px-3.5 py-1.5 text-[13px] text-ink">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Block>
        )}

        {it.downloads.length > 0 && (
          <Block id="downloads" eyebrow="Downloads" title="Spec sheets & brochures">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {it.downloads.map((d) => (
                <li key={d.href}>
                  <a href={d.href} target="_blank" rel="noopener noreferrer" className="card card-hover group flex items-center gap-4 p-5 no-underline">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-ink">
                      <FileDown className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{d.label}</span>
                      <span className="block truncate font-mono text-xs text-subtle">PDF · {it.model || it.title}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </li>
              ))}
              <li>
                <a href="/catalogues" className="group flex h-full items-center gap-4 rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 no-underline hover:border-ink/40">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">All catalogues</span>
                    <span className="block text-sm text-muted">Every product family in one place</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted transition-transform duration-300 group-hover:translate-x-0.5" />
                </a>
              </li>
            </ul>
          </Block>
        )}

        {(showcase || galleryImages.length > 0) && (
          <section id="gallery" className="scroll-mt-36 border-t border-line py-14 sm:py-20">
            <SectionHeader eyebrow={system ? "Projects" : "Gallery"} title={system ? "On site with our customers" : "Up close"} />
            {showcase ? (
              <Showcase title={it.title} filters={showcase.filters} items={showcase.items} />
            ) : (
              <Showcase title={it.title} filters={[]} items={galleryImages.map((g, i) => ({ image: g, title: `${it.title} — view ${i + 2}`, caption: "", filters: [] }))} />
            )}
          </section>
        )}

        {faqs.length > 0 && (
          <Block id="faq" eyebrow="FAQ" title={`${sub!.name} questions`}>
            <Accordion
              items={faqs.map((f, i) => ({ id: String(i), title: f.q, content: <div className="prose-mt" dangerouslySetInnerHTML={{ __html: cleanHtml(f.a) }} /> }))}
            />
          </Block>
        )}
      </div>

      {it.clients.length > 0 && (
        <section className="border-y border-line bg-white py-10">
          <div className="container-x mb-6">
            <p className="eyebrow">Trusted on site by</p>
          </div>
          <Marquee slow>
            {it.clients.map((src) => (
              <Img key={src} src={src} alt="Client logo" className="h-12 w-auto max-w-[140px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
            ))}
          </Marquee>
        </section>
      )}


      {related.length > 0 && (
        <Section>
          <SectionHeader
            eyebrow="Related"
            title={system ? "Related systems" : "You may also consider"}
            action={
              <Button href={`/products/${it.category}${sub && !system ? `?sub=${sub.slug}` : ""}`} variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
                View all
              </Button>
            }
          />
          <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.slug} className="min-w-0">
                <ProductCard item={r} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

import Link from "next/link";
import {
  ArrowUpRight,
  Compass,
  Factory,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  Lightbulb,
  ShoppingBag,
  Target,
  Telescope,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Img from "@/ui/Img";
import { Section, SectionHeader } from "@/ui/kit/Section";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { sentenceCase, splitPoint } from "@/ui/Company/lib";

/* ------------------------------------------------------------------ principles */

type Principle = { prefix: string; title: string; html: string };

const principleIcon: Record<string, LucideIcon> = { Mission: Target, Vision: Telescope, Purpose: Compass, Culture: HeartHandshake };
const richCls =
  "text-[15px] leading-relaxed [&_b]:font-semibold [&_li]:mt-1 [&_p]:mb-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:marker:text-current";

export function Principles({ title, items }: { title: string; items: Principle[] }) {
  const by = (t: string) => items.find((p) => p.title === t);
  const vision = by("Vision");
  const rest = items.filter((p) => p !== vision);
  const tone = ["bg-white", "bg-white", "bg-graphite text-white"];
  return (
    <Section id="group-principle" className="scroll-mt-28">
      <span id="groupprinciple" className="block -translate-y-28" aria-hidden />
      <SectionHeader eyebrow={title} title="What we stand for." description="Four principles that shape every machine we build, rent and service." />
      <Stagger className="grid gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {vision && (
          <StaggerItem className="lg:col-span-2 lg:row-span-2">
            <article className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[var(--radius-panel)] bg-brand p-7 sm:p-10">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] tracking-[0.14em] text-ink/60 uppercase">
                  {vision.prefix} {vision.title}
                </p>
                <Telescope className="h-6 w-6" />
              </div>
              <p aria-hidden className="mt-auto text-[clamp(5rem,13vw,10rem)] leading-[0.8] font-semibold tracking-[-0.06em]">
                10×30
              </p>
              <div className={`mt-6 max-w-lg text-ink/80 ${richCls} [&_b]:text-ink [&_p:first-child_b]:text-lg`} dangerouslySetInnerHTML={{ __html: vision.html }} />
            </article>
          </StaggerItem>
        )}
        {rest.map((p, i) => {
          const Icon = principleIcon[p.title] ?? Target;
          const dark = tone[i]?.includes("graphite");
          return (
            <StaggerItem key={p.title} className={i === 0 ? "lg:col-span-2" : ""}>
              <article className={`flex h-full flex-col rounded-[var(--radius-card)] border p-7 ${dark ? "border-transparent" : "border-line"} ${tone[i] ?? "bg-white"}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-mono text-[11px] tracking-[0.14em] uppercase ${dark ? "text-white/50" : "text-subtle"}`}>Principle {String(items.indexOf(p) + 1).padStart(2, "0")}</p>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full ${dark ? "bg-brand text-ink" : "bg-canvas text-ink"}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                </div>
                <h3 className={`mt-6 text-3xl tracking-[-0.03em] ${dark ? "text-white" : ""}`}>{p.title}</h3>
                <div className={`mt-3 ${richCls} ${dark ? "text-white/70 [&_b]:text-white" : "text-muted [&_b]:text-ink"}`} dangerouslySetInnerHTML={{ __html: p.html }} />
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ powering progress */

const capIcon: Record<string, LucideIcon> = {
  MANUFACTURING: Factory,
  SALES: ShoppingBag,
  RENTING: KeyRound,
  SERVICE: Wrench,
  TRAINING: GraduationCap,
  CONSULTING: Lightbulb,
};

export function PoweringProgress({
  title,
  tagline,
  cards,
}: {
  title: string;
  tagline?: string | null;
  cards: { id?: string | null; label: string; description?: string | null }[];
}) {
  return (
    <Section id="PoweringProgress" tone="white" className="scroll-mt-28">
      <SectionHeader eyebrow={sentenceCase(title)} title="Six capabilities, one accountable partner." description={tagline} />
      <Stagger className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => {
          const Icon = capIcon[c.label.toUpperCase()] ?? Lightbulb;
          return (
            <StaggerItem key={c.id ?? c.label} className="group bg-white p-7 transition-colors duration-500 hover:bg-canvas sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-ink transition-colors duration-500 group-hover:bg-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-8 text-xl">{sentenceCase(c.label)}</h3>
              {c.description && <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>}
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ group companies */

type Brand = { logo: string | null; alt: string; title: string; text: string; href: string | null };
export type GroupUnit = { title: string; icon: string | null; brands: Brand[] };

export function GroupCompanies({ title, units }: { title: string; units: GroupUnit[] }) {
  const total = units.reduce((n, u) => n + u.brands.length, 0);
  return (
    <Section id="bussiness-unit" className="scroll-mt-28">
      <SectionHeader
        eyebrow={sentenceCase(title)}
        title="A group built around your site."
        description={`${units.length} business verticals and ${total} companies & partner brands — each a specialist, all one Mtandt.`}
      />
      <Stagger className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {units.map((u, i) => (
          <StaggerItem key={u.title}>
            <article className="card card-hover flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-canvas">
                  <Img src={u.icon ?? undefined} alt="" className="h-8 w-8 object-contain mix-blend-multiply" />
                </span>
                <span className="font-mono text-[11px] text-subtle">
                  {String(i + 1).padStart(2, "0")} · {u.brands.length} brands
                </span>
              </div>
              <h3 className="mt-5 text-lg leading-snug">{u.title}</h3>
              <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-5">
                {u.brands.slice(0, 6).map((b) => {
                  const inner = b.logo ? (
                    <Img src={b.logo} alt={b.title} className="h-7 w-full object-contain mix-blend-multiply" />
                  ) : (
                    <span className="text-[11px] font-medium">{b.title}</span>
                  );
                  return (
                    <li key={b.title + b.logo}>
                      {b.href ? (
                        <a
                          href={b.href}
                          title={b.title}
                          {...(b.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="flex h-12 items-center justify-center rounded-xl bg-canvas px-2 transition-colors hover:bg-brand/40"
                        >
                          {inner}
                        </a>
                      ) : (
                        <span title={b.title} className="flex h-12 items-center justify-center rounded-xl bg-canvas px-2">
                          {inner}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              {u.brands.length > 6 && <p className="mt-3 text-[12px] text-muted">+ {u.brands.length - 6} more partner brands</p>}
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

/* ------------------------------------------------------------------ why */

export function WhyMtandt({ title, points, image }: { title: string; points: string[]; image: string | null }) {
  return (
    <Section id="WhyMTandT" tone="dark" className="scroll-mt-28 overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="lg:sticky lg:top-40 lg:self-start">
          <p className="eyebrow mb-5 text-white/60">{sentenceCase(title.replace("?", "")).replace("mtandt", "Mtandt")}?</p>
          <h2 className="display-md">Scale, range and fifty years of knowing the job.</h2>
          <p className="mt-5 max-w-md text-white/60">Five reasons thousands of contractors, plants and facilities keep coming back.</p>
          {image && (
            <Reveal delay={0.1} className="mt-10 hidden lg:block">
              <Img src={image} alt="Mtandt teams at work" className="w-full max-w-md" />
            </Reveal>
          )}
        </div>
        <Stagger className="divide-y divide-white/10 border-y border-white/10">
          {points.map((raw, i) => {
            const p = splitPoint(raw);
            return (
              <StaggerItem key={raw} className="group grid grid-cols-[48px_minmax(0,1fr)] gap-4 py-7 sm:grid-cols-[64px_minmax(0,1fr)]">
                <span className="font-mono text-sm text-brand">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  {p.title && <h3 className="text-xl text-white transition-colors group-hover:text-brand">{p.title}</h3>}
                  <p className="mt-2 leading-relaxed text-white/60">{p.text}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ accreditations & awards */

export function AccreditationsAwards({
  acc,
  awards,
}: {
  acc: { title: string; text: string; logos: (string | null)[] };
  awards: { title: string; text: string; images: (string | null)[] };
}) {
  return (
    <Section id="accreditations" tone="white" className="scroll-mt-28">
      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal className="flex flex-col rounded-[var(--radius-panel)] border border-line bg-canvas p-7 sm:p-10">
          <p className="eyebrow mb-4">Accreditations</p>
          <h2 className="display-md">{acc.title}</h2>
          <p className="mt-4 leading-relaxed text-muted">{acc.text}</p>
          <ul className="mt-auto grid grid-cols-3 gap-3 pt-8 sm:grid-cols-5">
            {acc.logos.filter(Boolean).map((src) => (
              <li key={src} className="flex aspect-square items-center justify-center rounded-2xl bg-white p-3 ring-1 ring-line">
                <Img src={src!} alt="Divisional accreditation" className="max-h-full max-w-full object-contain" />
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.08} id="awards" className="flex scroll-mt-40 flex-col rounded-[var(--radius-panel)] bg-graphite p-7 text-white sm:p-10">
          <p className="eyebrow mb-4 text-white/60">Recognition</p>
          <h2 className="display-md text-white">{awards.title}</h2>
          <p className="mt-4 leading-relaxed text-white/60">{awards.text}</p>
          <div className="mt-auto flex flex-wrap gap-4 pt-8">
            {awards.images.filter(Boolean).map((src) => (
              <div key={src} className="group flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <Img src={src!} alt={awards.title} className="h-auto max-h-56 w-auto max-w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
              </div>
            ))}
          </div>
          <Link href="/media" className="mt-6 inline-flex items-center gap-1.5 self-start text-sm text-white/70 no-underline hover:text-brand">
            News & press <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calendar, GraduationCap, HardHat, ShieldCheck, Wrench } from "lucide-react";
import Img from "@/ui/Img";
import Marquee from "@/ui/kit/Marquee";
import { Section, SectionHeader } from "@/ui/kit/Section";
import { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Button } from "@/ui/kit/Button";

type Tile = { slug: string; title: string; href: string; image: string | null; count: number; photo: boolean; subs: { label: string; href: string }[] };

/** 8 categories as a bento grid: two feature tiles, six compact. */
export function CategoryBento({ tiles }: { tiles: Tile[] }) {
  return (
    <Section>
      <SectionHeader
        eyebrow="Equipment"
        title={
          <>
            One partner for every
            <br className="hidden sm:block" /> height, load and site.
          </>
        }
        description="219 machines and systems across eight families — available to buy, rent, or both."
        action={
          <Button href="/products" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
            Browse all
          </Button>
        }
      />
      <Stagger className="grid grid-flow-dense auto-rows-[220px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tiles.map((t, i) => {
          // 1 feature (2x2) + 1 wide (2x1) + 6 singles = exactly 3 rows of 4
          const big = i === 0;
          const wide = i === 1;
          const photo = t.photo && !big;
          return (
            <StaggerItem key={t.slug} className={big ? "col-span-2 row-span-2" : wide ? "col-span-2" : ""}>
              <Link
                href={t.href}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border p-5 no-underline transition-[border-color,box-shadow] duration-500 hover:shadow-[var(--shadow-lift)] sm:p-6 ${
                  photo ? "border-transparent bg-graphite" : "border-line bg-white hover:border-line-strong"
                }`}
              >
                {photo && t.image && (
                  <>
                    <Img
                      src={t.image}
                      alt=""
                      className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/30 to-ink/10" />
                  </>
                )}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <h3 className={`${big ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"} leading-tight ${photo ? "text-white" : ""}`}>{t.title}</h3>
                    <p className={`mt-1 font-mono text-[11px] ${photo ? "text-white/60" : "text-subtle"}`}>{t.count} products</p>
                  </div>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-500 group-hover:bg-brand group-hover:text-ink ${
                      photo ? "bg-white/15 text-white backdrop-blur" : "bg-canvas text-ink"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
                  </span>
                </div>
                {(big || wide) && (
                  <ul className={`relative z-10 mt-4 flex flex-wrap gap-1.5 ${wide ? "max-w-[50%]" : "max-w-[60%]"}`}>
                    {t.subs.slice(0, wide ? 3 : 4).map((s) => (
                      <li key={s.href} className="rounded-full bg-canvas px-2.5 py-1 text-xs text-ink-2">
                        {s.label}
                      </li>
                    ))}
                  </ul>
                )}
                {!photo && t.image && (
                  <Img
                    src={t.image}
                    alt=""
                    className={`pointer-events-none absolute object-contain mix-blend-multiply transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105 ${
                      big ? "right-6 bottom-6 h-[72%] w-[62%]" : wide ? "right-5 bottom-4 h-[70%] w-[45%]" : "right-4 bottom-4 h-[58%] w-[62%]"
                    }`}
                  />
                )}
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export function BuyRent() {
  const cards = [
    {
      mode: "buy",
      title: "Buy",
      text: "New machines from Mlift and 20+ partner brands, with warranty, AMC and operator training bundled.",
      points: ["OEM warranty", "Financing on request", "AMC & spares"],
      href: "/products?mode=buy",
      dark: false,
    },
    {
      mode: "rent",
      title: "Rent",
      text: "Short- or long-term hire from India's largest MEWP rental fleet, delivered and serviced on site.",
      points: ["Daily to multi-year terms", "Pan-India delivery", "Certified operators"],
      href: "/products?mode=rent",
      dark: true,
    },
  ];
  return (
    <Section tight>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.mode}
            href={c.href}
            className={`group relative overflow-hidden rounded-[var(--radius-panel)] p-8 no-underline transition-transform duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 sm:p-10 ${
              c.dark ? "bg-graphite text-white" : "bg-brand text-ink"
            }`}
          >
            <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${c.dark ? "text-white/50" : "text-ink/60"}`}>Mode</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className={`text-6xl font-semibold tracking-[-0.05em] sm:text-7xl ${c.dark ? "text-white" : "text-ink"}`}>{c.title}</h3>
              <span className={`flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-500 group-hover:-rotate-45 ${c.dark ? "bg-brand text-ink" : "bg-ink text-white"}`}>
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <p className={`mt-6 max-w-md ${c.dark ? "text-white/70" : "text-ink/75"}`}>{c.text}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {c.points.map((p) => (
                <li key={p} className={`rounded-full px-3 py-1.5 text-[13px] ${c.dark ? "bg-white/10 text-white" : "bg-ink/10 text-ink"}`}>
                  {p}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </Section>
  );
}

const pillarIcons = [GraduationCap, Wrench, HardHat];

export function ServicePillars({
  pillars,
}: {
  pillars: { title: string; href: string; text: string; image: string | null; links: { label: string; href: string }[] }[];
}) {
  return (
    <Section tone="dark" id="services">
      <SectionHeader
        dark
        eyebrow="Services"
        title="Beyond the machine."
        description="Certified training, lifecycle management and industrial rope access — delivered by the teams who know the equipment best."
        action={
          <Button href="/services" variant="light" icon={<ArrowRight className="h-4 w-4" />}>
            All services
          </Button>
        }
      />
      <Stagger className="grid gap-4 lg:grid-cols-3">
        {pillars.map((p, i) => {
          const Icon = pillarIcons[i % pillarIcons.length];
          return (
            <StaggerItem key={p.href}>
              <div className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-graphite-2 ring-1 ring-white/5">
                <Link href={p.href} className="relative block aspect-[16/10] overflow-hidden no-underline">
                  {p.image && (
                    <Img src={p.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite-2 to-transparent" />
                  <span className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <Link href={p.href} className="no-underline">
                    <h3 className="text-xl text-white">{p.title}</h3>
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{p.text}</p>
                  <ul className="mt-5 space-y-1 border-t border-white/10 pt-4">
                    {p.links.slice(0, 4).map((l) => (
                      <li key={l.href}>
                        <Link href={l.href} className="flex items-center justify-between py-1.5 text-sm text-white/80 no-underline hover:text-brand">
                          {l.label}
                          <ArrowRight className="h-3.5 w-3.5 opacity-40" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export function WhyUs({ items }: { items: { title: string; text: string }[] }) {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow mb-5">Why Mtandt</p>
          <h2 className="display-md">Five decades of getting people safely to height.</h2>
          <p className="lead mt-5 max-w-md">Since 1974, the same promise: the right equipment, the right people, on time.</p>
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <ShieldCheck className="h-5 w-5 text-ink" /> ISO & NSDC certified · BSC · IRATA · GWO
          </div>
        </div>
        <Stagger className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2">
          {items.map((w, i) => (
            <StaggerItem key={w.title} className="bg-white p-7">
              <p className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-6 text-lg">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </Section>
  );
}

type BlogCard = { slug: string; title: string; excerpt: string; date: string | null; image: string | null; category: string | null };

export function Latest({ blogs, events }: { blogs: BlogCard[]; events: { href: string; title: string; date: string | null }[] }) {
  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
  return (
    <Section>
      <SectionHeader
        eyebrow="Media"
        title="Insights from the field."
        action={
          <Button href="/media" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
            Newsroom
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Stagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {blogs.map((b) => (
            <StaggerItem key={b.slug}>
              <Link href={`/blogs/${b.slug}`} className="group flex h-full flex-col no-underline">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-line">
                  <Img src={b.image ?? undefined} alt={b.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                  {b.category && <span className="glass absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium text-ink">{b.category}</span>}
                </div>
                <p className="mt-4 font-mono text-[11px] text-subtle">{fmt(b.date)}</p>
                <h3 className="mt-1 text-base leading-snug transition-colors group-hover:text-ink-2">{b.title}</h3>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="card flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Upcoming & recent events</p>
            <Link href="/media?type=events" className="text-[13px] text-muted no-underline hover:text-ink">
              All
            </Link>
          </div>
          <ul className="-mx-2 flex-1 divide-y divide-line">
            {events.slice(0, 6).map((e) => (
              <li key={e.href}>
                <Link href={e.href} className="flex items-start gap-3 rounded-xl px-2 py-3 no-underline hover:bg-canvas">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <span>
                    <span className="block text-sm font-medium leading-snug text-ink">{e.title}</span>
                    {e.date && <span className="font-mono text-[11px] text-subtle">{fmt(e.date)}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

export function ClientsStrip({ logos }: { logos: string[] }) {
  return (
    <section className="border-y border-line bg-white py-10">
      <div className="container-x mb-6 flex items-center justify-between">
        <p className="eyebrow">Trusted by 5,000+ customers</p>
      </div>
      <Marquee slow>
        {logos.map((src) => (
          <Img key={src} src={src} alt="Client logo" className="h-12 w-auto max-w-[140px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
        ))}
      </Marquee>
    </section>
  );
}

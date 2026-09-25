import type { Metadata } from "next";
import { ArrowDown, HeartHandshake, Mail, Sparkles, TrendingUp } from "lucide-react";
import data from "@/content/scraped/career.json";
import { contact } from "@/content/site";
import Img from "@/ui/Img";
import { Button } from "@/ui/kit/Button";
import PageHero from "@/ui/kit/PageHero";
import Reveal, { Stagger, StaggerItem } from "@/ui/kit/Reveal";
import { Section, SectionHeader } from "@/ui/kit/Section";
import CareerForm from "@/ui/Career/CareerForm";
import Openings from "@/ui/Career/Openings";
import { jobMeta, slugify } from "@/ui/Company/lib";

export const metadata: Metadata = {
  title: "Careers | Mtandt Group",
  description: "Join Mtandt Group - for the ones who get it done, Dil Se. Explore current openings and apply with your resume.",
  alternates: { canonical: "/career" },
};

const values = [
  { icon: Sparkles, title: "Delivering Exceptionally Good Experiences", text: "To customers, to colleagues, and to ourselves." },
  { icon: HeartHandshake, title: "Dil Se Seva", text: "Serving with sincerity — consistently, responsibly, and from the heart." },
  { icon: TrendingUp, title: "Test limits, keep learning", text: "Celebrating every small step that leads to something bigger." },
];

export default function Page() {
  const jobs = data.jobs.map((j) => ({ id: slugify(j.title), title: j.title.trim(), html: j.html, ...jobMeta(j.title, j.html) }));
  // Culture copy: the first paragraph is the story, the rest is the "Join Mtandt" sign-off.
  const paras = data.html.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  const story = paras.slice(0, 2).join("");
  const signoff = paras.slice(2).map((p) => p.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
  const locations = new Set(jobs.flatMap((j) => (j.location ?? "").split(/,\s*/)).filter(Boolean));

  return (
    <>
      <PageHero
        crumbs={[{ label: "Company", href: "/about-us" }, { label: "Careers" }]}
        eyebrow="Careers at Mtandt"
        title={
          <>
            For the ones who get it done — <span className="bg-[linear-gradient(transparent_62%,var(--color-brand)_62%)]">Dil Se.</span>
          </>
        }
        description={data.tagline}
        actions={
          <>
            <Button href="#openings" variant="dark" icon={<ArrowDown className="h-4 w-4" />}>
              {jobs.length} open roles
            </Button>
            <Button href="#interest-form" variant="outline">
              Send your résumé
            </Button>
          </>
        }
        aside={
          <div className="mx-auto grid max-w-md grid-cols-2 gap-3 pb-6 lg:mr-0">
            {data.images.map((src, i) => (
              <div key={src} className={`relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-line ${i % 2 ? "translate-y-6" : ""}`}>
                <Img src={src} alt="Life at Mtandt" loading={i < 2 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ))}
          </div>
        }
      >
        <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
          {[
            [String(jobs.length), "Open roles"],
            [String(locations.size), "Cities hiring"],
            ["1974", "Since"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="text-[12px] text-muted">{l}</dt>
              <dd className="font-mono text-2xl tabular">{v}</dd>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Culture */}
      <Section tone="dark" id="culture" className="mt-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-5 text-white/60">Culture</p>
            <h2 className="display-md">{data.heading}</h2>
            {signoff.length > 0 && (
              <div className="mt-8 border-l-2 border-brand pl-5">
                {signoff.map((s, i) => (
                  <p key={s} className={i === 0 ? "text-xl font-semibold text-white" : "mt-1 text-white/60"}>
                    {s}
                  </p>
                ))}
              </div>
            )}
          </Reveal>
          <Reveal delay={0.08}>
            <div className="prose-mt text-white/70 [&_b]:text-white" dangerouslySetInnerHTML={{ __html: story }} />
          </Reveal>
        </div>
        <Stagger className="mt-14 grid gap-3 sm:grid-cols-3 sm:gap-4">
          {values.map((v) => (
            <StaggerItem key={v.title} className="rounded-[var(--radius-card)] bg-graphite-2 p-6 ring-1 ring-white/5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-ink">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-lg text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-white/60">{v.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Openings */}
      <Section id="openings" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Open roles"
          title="Find your next climb."
          description="Tap a role for the full description. Don't see a fit? Send us your résumé anyway."
          action={
            <Button href={`mailto:${contact.email}?subject=Career%20enquiry`} variant="outline" icon={<Mail className="h-4 w-4" />}>
              Email HR
            </Button>
          }
        />
        {jobs.length ? (
          <Openings jobs={jobs} />
        ) : (
          <p className="card p-10 text-center text-muted">No open roles right now — you can still send us your résumé below.</p>
        )}
      </Section>

      {/* Application */}
      <Section id="interest-form" tone="white" className="scroll-mt-24">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow mb-4">{data.form.title}</p>
            <h2 className="display-md">Apply in three minutes.</h2>
            <p className="mt-4 text-muted">{data.form.subtitle} — attach your résumé and our HR team will be in touch.</p>
            <ol className="mt-8 space-y-4">
              {["Tell us about you", "Pick the role and your area", "Attach your résumé"].map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas font-mono text-xs">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="min-w-0 rounded-[var(--radius-panel)] border border-line p-5 sm:p-8">
            <CareerForm functionalAreas={data.form.functionalAreas} education={data.form.education} />
          </div>
        </div>
      </Section>
    </>
  );
}

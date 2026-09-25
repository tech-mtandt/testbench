import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { servicesFor } from "@/content/catalog-view";
import { servicesIndex } from "@/content/services";
import Img from "@/ui/Img";
import { Button } from "@/ui/kit/Button";
import { Section, SectionHeader } from "@/ui/kit/Section";
import { Stagger, StaggerItem } from "@/ui/kit/Reveal";

/** Dark band linking the services that pair with a category (training, AMC, manpower…). */
export default function ServicesCta({ category, title = "Beyond the machine." }: { category: string; title?: string }) {
  const items = servicesFor(category)
    .map((slug) => servicesIndex.items.find((s) => s.slug === slug))
    .filter((s): s is (typeof servicesIndex.items)[number] => !!s);
  if (!items.length) return null;
  return (
    <Section>
      <SectionHeader
        eyebrow="Pairs well with"
        title={title}
        description="Certified operator training, maintenance and on-site manpower from the teams who know the equipment best."
        action={
          <Button href="/services" variant="outline" icon={<ArrowRight className="h-4 w-4" />}>
            All services
          </Button>
        }
      />
      <Stagger className="grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <StaggerItem key={s.slug}>
            <Link href={`/services/${s.slug}`} className="group flex h-full flex-col overflow-hidden card card-hover no-underline">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Img src={s.image ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg">{s.title}</h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-transform duration-500 group-hover:rotate-45 group-hover:text-ink" />
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{s.excerpt}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

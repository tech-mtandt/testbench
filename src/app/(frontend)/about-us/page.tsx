import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { mediaAlt, mediaUrl, payloadClient } from "@/lib/payload";
import type { About } from "@/payload-types";
import data from "@/content/scraped/about.json";
import TeamCarousel, { type TeamMember } from "@/ui/TeamCarousel";
import { SectionTitle } from "@/ui/PageChrome";
import {
  AccreditationsAwards,
  GroupCompanies,
  Journey,
  PoweringProgress,
  Principles,
  WhyMtandt,
} from "@/ui/About/Sections";

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description,
  alternates: { canonical: "/about-us" },
};

function youTubeEmbed(url?: string | null) {
  const m = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const livePhoto = new Map([...data.investors, ...data.management].map((m) => [m.name.toLowerCase(), m.image]));

/** DB team rows; rows without a designation override are placeholder/test users and are skipped. */
function dbMembers(entries: About["investors"]): TeamMember[] {
  return (entries ?? [])
    .filter((e) => e.designation && e.user && typeof e.user === "object")
    .map((e) => {
      const u = e.user as Exclude<typeof e.user, number>;
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
      return {
        id: e.id ?? String(u.id),
        name,
        fallbackUrl: livePhoto.get(name.toLowerCase()),
        designation: e.designation || u.jobTitle,
        imageUrl: mediaUrl(u.profilePicture),
        imageAlt: mediaAlt(u.profilePicture),
      };
    });
}

const scrapedMembers = (rows: { name: string; designation: string; image: string | null }[]): TeamMember[] =>
  rows.map((r) => ({ id: r.name, name: r.name, designation: r.designation, imageUrl: r.image }));

/** Prefer the DB list, unless it is less complete than what is live. */
const pick = (db: TeamMember[], live: TeamMember[]) => (db.length >= live.length ? db : live);

async function getAbout(): Promise<About | null> {
  try {
    const payload = await payloadClient();
    return await payload.findGlobal({ slug: "about", depth: 2 });
  } catch (err) {
    console.error("[about-us] failed to load about global", err);
    return null;
  }
}

export default async function Page() {
  const about = await getAbout();
  const video = youTubeEmbed(about?.link) ?? data.who.video;
  const investors = pick(dbMembers(about?.investors), scrapedMembers(data.investors));
  const management = pick(dbMembers(about?.management), scrapedMembers(data.management));
  const cards = about?.poweringProgressCards?.length ? about.poweringProgressCards : data.powering.cards;

  return (
    <>
      <section id="whoweare" className="scroll-mt-28 bg-surface pt-12 pb-10">
        <div className="default-margin">
          <h1 className="mb-6 text-center text-2xl font-bold text-[#444] md:text-3xl">
            <span className="bg-[linear-gradient(transparent_60%,var(--color-brand)_60%)] px-1">ABOUT US</span>
          </h1>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="min-w-0">
              <SectionTitle className="mb-4">{about?.title || data.who.title}</SectionTitle>
              {about?.content ? (
                <RichText data={about.content} className="prose-legacy text-sm [&_p:first-child]:text-base [&_p:first-child]:text-ink [&_p:has(>br:only-child)]:hidden" />
              ) : (
                <div
                  className="prose-legacy text-sm [&_p:first-child]:text-base [&_p:first-child]:text-ink"
                  dangerouslySetInnerHTML={{ __html: data.who.html }}
                />
              )}
            </div>
            {video && (
              <div className="aspect-video w-full min-w-0">
                <iframe
                  src={video}
                  title="Mtandt Group"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <Principles title={data.principlesTitle} items={data.principles} />

      <PoweringProgress
        title={data.powering.title}
        tagline={about?.poweringProgressTagline || data.powering.tagline}
        cards={cards}
      />

      <GroupCompanies title={data.companiesTitle} items={data.companies} />

      <section id="team" className="scroll-mt-28 bg-white py-12">
        <div className="default-margin flex flex-col gap-10">
          <div>
            <SectionTitle className="mb-4">Investors</SectionTitle>
            <TeamCarousel members={investors} perView={3} size="lg" />
          </div>
          <div>
            <SectionTitle className="mb-4">Our Management</SectionTitle>
            <TeamCarousel members={management} perView={5} />
          </div>
        </div>
      </section>

      <WhyMtandt why={data.why} />
      <Journey journey={data.journey} />
      <AccreditationsAwards acc={data.accreditations} awards={data.awards} />
    </>
  );
}

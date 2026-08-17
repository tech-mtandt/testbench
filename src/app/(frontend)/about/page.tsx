import configPromise from "@payload-config";
import { getPayload } from "payload";
import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/components/RichText";
import TeamCarousel, { type TeamMember } from "@/ui/TeamCarousel";
import type { About } from "@/payload-types";

function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

function toTeamMembers(entries: NonNullable<About["investors"]>): TeamMember[] {
  return entries
    .filter((entry) => entry.user && typeof entry.user === "object")
    .map((entry) => {
      const user = entry.user as Exclude<typeof entry.user, number>;
      const profilePicture =
        user.profilePicture && typeof user.profilePicture === "object"
          ? user.profilePicture
          : null;

      return {
        id: entry.id ?? String(user.id),
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.email,
        designation: entry.designation || user.jobTitle,
        imageUrl: profilePicture?.url,
        imageAlt: profilePicture?.alt,
      };
    });
}

export default async function Page() {
  const payload = await getPayload({ config: configPromise });
  const about = await payload.findGlobal({ slug: "about" });

  const featuredImage =
    about.featuredImage && typeof about.featuredImage === "object"
      ? about.featuredImage
      : null;

  const embedUrl = getYouTubeEmbedUrl(about.link);

  const investors = about.investors ? toTeamMembers(about.investors) : [];
  const management = about.management ? toTeamMembers(about.management) : [];

  return (
    <div className="min-h-[80vh]">
      <div className="bg-[#f9f9f9] pt-12 flex flex-col gap-10">
        <div className="default-margin">
          <div className="flex justify-center mb-8">
            <h2 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
              About Us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 items-center">
            <div className="md:col-span-2 flex flex-col gap-4">
              <h5 className="border-l-4 border-primary-yellow pl-4 font-semibold">
                {about.title || "Who We Are"}
              </h5>
              {about.content && <RichText data={about.content} />}
            </div>

            <div className="md:col-span-2">
              {embedUrl ? (
                <div className="w-full aspect-video">
                  <iframe
                    src={embedUrl}
                    title={about.title || "About us video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-full aspect-video bg-black/5 flex items-center justify-center text-sm text-black/40">
                  No video added yet
                </div>
              )}
            </div>
          </div>

          {featuredImage?.url && (
            <div className="w-full flex justify-center">
              <Image
                src={featuredImage.url}
                alt={featuredImage.alt}
                width={featuredImage.width ?? 800}
                height={featuredImage.height ?? 450}
                className="max-w-3xl w-full h-auto"
              />
            </div>
          )}
        </div>
      </div>
      <div className="bg-[#f9f9f9] py-12 flex flex-col gap-10">
        <div className="default-margin flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
              Powering Progress
            </h3>
            {about.poweringProgressTagline && (
              <p className="text-black/70">{about.poweringProgressTagline}</p>
            )}
          </div>

          {about.poweringProgressCards &&
            about.poweringProgressCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                {about.poweringProgressCards.map((card) => (
                  <div
                    key={card.id}
                    className="group relative border border-black/10 bg-white transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-primary-yellow hover:shadow-[0_24px_40px_-18px_rgba(245,227,17,0.55)]"
                  >
                    <span className="absolute -top-3 left-6 z-10 origin-left bg-primary-yellow text-xs font-bold uppercase px-3 py-1.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-110">
                      {card.label}
                    </span>
                    <div className="relative overflow-hidden p-6 pt-8">
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-0 top-0 h-full w-2/3 -translate-x-full bg-gradient-to-r from-transparent via-primary-yellow/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[250%]"
                      />
                      {card.description && (
                        <p className="relative text-sm text-black/70 transition-colors duration-300 group-hover:text-black">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
      <div className="relative overflow-hidden bg-[#eeeeee] py-12 flex flex-col gap-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(0,0,0,0.12), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              "radial-gradient(ellipse 60% 100% at 50% 100%, rgba(0,0,0,0.12), transparent 70%)",
          }}
        />
        <div className="default-margin flex flex-col gap-8">
          <h3 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
            MTANDT Group of Companies
          </h3>

          {about.groupOfCompanies && about.groupOfCompanies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {about.groupOfCompanies.map((company) => {
                const icon =
                  company.icon && typeof company.icon === "object"
                    ? company.icon
                    : null;

                return (
                  <Link
                    key={company.id}
                    href={company.link || "/"}
                    className="bg-white p-8 flex flex-col gap-4 hover:shadow-md transition-shadow"
                  >
                    {icon?.url && (
                      <Image
                        src={icon.url}
                        alt={icon.alt}
                        width={icon.width ?? 48}
                        height={icon.height ?? 48}
                        className="h-10 w-10 object-contain"
                      />
                    )}
                    <p className="font-semibold">{company.title}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {investors.length > 0 && (
        <div className="bg-white py-12 flex flex-col gap-10">
          <div className="default-margin flex flex-col gap-8">
            <h4 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
              Investors
            </h4>
            <TeamCarousel members={investors} />
          </div>
        </div>
      )}
      {management.length > 0 && (
        <div className="bg-white py-12 flex flex-col gap-10">
          <div className="default-margin flex flex-col gap-8">
            <h4 className="font-semibold uppercase underline decoration-primary-yellow decoration-4 underline-offset-8">
              Our Management
            </h4>
            <TeamCarousel members={management} />
          </div>
        </div>
      )}
    </div>
  );
}

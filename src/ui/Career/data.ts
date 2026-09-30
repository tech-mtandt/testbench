import career from "@/content/scraped/career.json";
import type { Career, CareerPage } from "@/payload-types";
import { cached, fileUrl, html, readAll, readGlobal } from "@/cms/read";

type Seo = { title: string | null; description: string | null; image: string | null } | null;

export type CareerData = {
  banner: string | null;
  title: string;
  heading: string;
  tagline: string;
  html: string;
  images: string[];
  jobs: { title: string; html: string }[];
  form: { title: string; subtitle: string; functionalAreas: string[]; education: string[] };
  seo: Seo;
};

/**
 * Careers page: the `career-page` global (whole-page fallback: career.json) plus the open
 * jobs from the `careers` collection (fallback: career.json jobs until any job exists).
 */
export const getCareer = cached(async (): Promise<CareerData> => {
  const [g, jobs] = await Promise.all([
    readGlobal<CareerPage>("career-page"),
    readAll<Career>("careers", { sort: ["order", "createdAt"] }),
  ]);
  const page = g
    ? {
        banner: fileUrl(g.banner),
        title: g.title,
        heading: g.heading ?? "",
        tagline: g.tagline ?? "",
        html: html(g.content),
        images: (g.images ?? []).map((m) => fileUrl(m)).filter((u): u is string => Boolean(u)),
        form: {
          title: g.form?.title ?? "",
          subtitle: g.form?.subtitle ?? "",
          functionalAreas: g.form?.functionalAreas ?? [],
          education: g.form?.education ?? [],
        },
        seo: g.meta ? { title: g.meta.title || null, description: g.meta.description || null, image: fileUrl(g.meta.image) } : null,
      }
    : { banner: career.banner, title: career.title, heading: career.heading, tagline: career.tagline, html: career.html, images: career.images, form: career.form, seo: null };
  return {
    ...page,
    jobs: jobs ? jobs.filter((j) => j.isOpen !== false).map((j) => ({ title: j.title, html: html(j.description) })) : career.jobs,
  };
}, "career-page");

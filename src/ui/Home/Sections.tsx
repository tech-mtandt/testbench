import Link from "next/link";
import Carousel from "@/ui/Carousel";
import Img from "@/ui/Img";
import { CalendarIcon, ChevronRight, SocialIcon } from "@/ui/Icons";
import { socials } from "@/content/site";

export function ServiceNavigator({
  intro,
  items,
}: {
  intro: string;
  items: { title: string; text: string; href: string }[];
}) {
  return (
    <section className="bg-[#1b1d1f] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.02)_0_2px,transparent_2px_6px)] py-12">
      <div className="default-margin grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
        <div className="lg:border-r lg:border-white/20 lg:pr-8">
          <h2 className="section-title section-title-yellow mb-4 text-brand!">Service Navigator</h2>
          <p className="text-white/85">{intro}</p>
        </div>
        <Carousel>
          {items.map((s) => (
            <div key={s.href} className="flex w-[70%] shrink-0 snap-start flex-col items-center text-center sm:w-[45%] lg:w-[calc(33.333%-14px)]">
              <h5 className="mb-3 text-base text-white">{s.title}</h5>
              <p className="mb-4 flex-1 text-sm text-white/70">{s.text}</p>
              <Link href={s.href} className="flex items-center gap-1 text-sm font-semibold text-brand no-underline">
                Know More <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

const whyIconPaths = [
  "M20 6 9 17l-5-5", // first time right
  "M3 17l6-6 4 4 8-8M14 7h7v7", // value for money
  "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.87M16 4.13a3 3 0 0 1 0 5.74", // team
  "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2z", // reach
  "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01", // range
  "M4 20V10M10 20V4M16 20v-8M22 20H2", // pioneer
];

export function WhyUs({ items }: { items: { title: string; text: string }[] }) {
  return (
    <section className="default-margin py-12">
      <h2 className="section-title mb-8">Why Us</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((w, i) => (
          <div key={w.title} className="border-2 border-brand-light bg-white px-6 py-7 text-center">
            <svg viewBox="0 0 24 24" aria-hidden className="mx-auto mb-3 h-9 w-9 text-brand" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d={whyIconPaths[i % whyIconPaths.length]} />
            </svg>
            <h5 className="mb-2 text-base">{w.title}</h5>
            <p className="text-sm">{w.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Clients({ logos }: { logos: string[] }) {
  return (
    <section className="py-12">
      <div className="default-margin">
        <h2 className="mb-8 text-center text-3xl">Our Clients</h2>
        <Carousel>
          {logos.map((src) => (
            <div key={src} className="flex h-24 w-[40%] shrink-0 snap-start items-center justify-center sm:w-[25%] lg:w-[calc(16.666%-17px)]">
              <Img src={src} alt="Client logo" className="max-h-full max-w-full object-contain" />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

type BlogCard = { slug: string; title: string; excerpt?: string | null; date?: string | null; image?: string | null };
type NewsItem = { href: string; title: string; date?: string | null };

export function HomeFeeds({ blog, news }: { blog: BlogCard | null; news: NewsItem[] }) {
  const panel = "flex flex-col border-[6px] border-neutral-100 bg-white p-4";
  return (
    <section className="bg-surface py-12">
      <div className="default-margin grid gap-6 md:grid-cols-3">
        <div className={panel}>
          <h4 className="mb-3 text-center text-base">Latest Blogs</h4>
          {blog ? (
            <Link href={`/blogs/${blog.slug}`} className="flex flex-col no-underline">
              <Img src={blog.image ?? undefined} alt={blog.title} className="mb-3 aspect-[3/2] w-full object-cover" />
              {blog.date && (
                <p className="mb-1 flex items-center gap-1 text-sm text-ink">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
              <h3 className="mb-2 text-base">{blog.title}</h3>
              {blog.excerpt && <p className="line-clamp-2 text-sm">{blog.excerpt}</p>}
            </Link>
          ) : (
            <p className="text-sm">No posts yet.</p>
          )}
        </div>
        <div className={panel}>
          <h4 className="mb-3 text-center text-base">Social Media</h4>
          <p className="mb-4 text-sm">Follow Mtandt Group for project updates, events and product launches.</p>
          <ul className="space-y-2">
            {socials.map((s) => (
              <li key={s.key}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-ink no-underline hover:underline">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
                    <SocialIcon name={s.key} className="h-3.5 w-3.5" />
                  </span>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={panel}>
          <h4 className="mb-3 text-center text-base">News and Events</h4>
          <ul className="max-h-80 divide-y divide-neutral-200 overflow-y-auto pr-1">
            {news.map((n) => (
              <li key={n.href} className="py-2.5">
                <Link href={n.href} className="block no-underline">
                  <span className="block text-sm font-medium leading-snug text-ink">{n.title}</span>
                  {n.date && <span className="text-xs text-ink-soft">{n.date}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

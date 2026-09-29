import Link from "next/link";
import type { SVGProps } from "react";
import { CalendarIcon } from "@/ui/Icons";

type P = SVGProps<SVGSVGElement>;

const BlogIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <path d="M4 20c0-8 4-12 12-12" />
    <path d="M4 20V4m0 16h16" />
    <circle cx="16" cy="8" r="3" />
  </svg>
);
const PressIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9h4v4H7zM14 9h3M14 13h3M7 16h10" />
  </svg>
);
const ImageIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="m21 17-5-5-9 8" />
  </svg>
);

export type MediaTab = "blogs" | "press" | "events" | "gallery";

const TABS: { key: MediaTab; label: string; href: string; Icon: (p: P) => React.ReactElement }[] = [
  { key: "blogs", label: "Blogs", href: "/media/blogs", Icon: BlogIcon },
  { key: "press", label: "Press", href: "/media/press", Icon: PressIcon },
  { key: "events", label: "Events", href: "/media/events", Icon: CalendarIcon },
  { key: "gallery", label: "Gallery", href: "/media/gallery", Icon: ImageIcon },
];

export default function MediaTabs({ active }: { active: MediaTab }) {
  return (
    <nav aria-label="Media sections" className="relative z-10 -mt-6 px-4 lg:-mt-[27px]">
      <ul className="mx-auto grid max-w-[762px] grid-cols-4 shadow-sm">
        {TABS.map(({ key, label, href, Icon }) => {
          const on = key === active;
          return (
            <li key={key} className="border-r border-black/10 last:border-r-0">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex h-11 items-center justify-center gap-1.5 text-xs font-medium no-underline transition-colors sm:text-sm lg:h-[54px] lg:text-[15px] ${
                  on ? "bg-[#595959] text-white" : "bg-brand-light text-ink hover:bg-brand"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

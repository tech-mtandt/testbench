import Link from "next/link";
import Img from "@/ui/Img";

export type SideItem = { href: string; title: string; image: string | null; date: string };

/** "Latest Blogs" / "Latest Press" sidebar: thumbnail + title + date. */
export default function SideList({ title, items }: { title: string; items: SideItem[] }) {
  return (
    <aside className="lg:pt-10">
      <h4 className="mb-4 text-lg font-semibold">{title}</h4>
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="group flex gap-3 no-underline">
              <span className="block h-[80px] w-[110px] shrink-0 overflow-hidden bg-neutral-200">
                <Img src={it.image || undefined} alt="" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-4 text-[13px] font-semibold leading-snug text-ink-soft group-hover:text-ink">
                  {it.title}
                </span>
                <span className="mt-1 block text-[11px] text-ink-soft">{it.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

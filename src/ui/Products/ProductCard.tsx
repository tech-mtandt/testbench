import Link from "next/link";
import Img from "@/ui/Img";
import { PlusIcon } from "@/ui/Icons";

/** Related-products / search grid card (image, truncated title, yellow "+" badge). */
export default function ProductCard({ href, title, image, className = "" }: { href: string; title: string; image: string | null; className?: string }) {
  return (
    <Link
      href={href}
      className={`relative mb-5 flex flex-col bg-white shadow-[0_2px_10px_rgba(0,0,0,0.15)] no-underline ${className}`}
    >
      <div className="flex h-48 items-center justify-center p-4">
        <Img src={image ?? undefined} alt={title} className="max-h-full max-w-full object-contain" />
      </div>
      <h3 className="truncate px-4 pb-9 text-center text-[13px] font-semibold uppercase tracking-wide text-ink" title={title}>
        {title}
      </h3>
      <span className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-brand text-ink shadow">
        <PlusIcon className="h-4 w-4" />
      </span>
    </Link>
  );
}

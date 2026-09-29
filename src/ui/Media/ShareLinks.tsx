import { SocialIcon } from "@/ui/Icons";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

/** Facebook / Twitter / LinkedIn share buttons (yellow rings), as on legacy detail pages. */
export default function ShareLinks({ path }: { path: string }) {
  const u = encodeURIComponent(`${SITE}${path}`);
  const links = [
    { name: "facebook" as const, label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "twitter" as const, label: "Share on Twitter", href: `https://twitter.com/share?url=${u}&text=mtandt` },
    { name: "linkedin" as const, label: "Share on LinkedIn", href: `https://www.linkedin.com/shareArticle?mini=true&url=${u}&title=mtandt` },
  ];
  return (
    <div className="mt-10 flex justify-center gap-2">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand text-ink hover:bg-brand"
        >
          <SocialIcon name={l.name} className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

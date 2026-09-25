"use client";

import { Check, Link2, Mail } from "lucide-react";
import { useState } from "react";
import { SocialIcon, WhatsAppIcon } from "@/ui/Icons";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mtandt.com";

const btn =
  "flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink no-underline transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-white";

/** Copy link + LinkedIn / X / WhatsApp / email share buttons. */
export default function Share({ path, title, label = true }: { path: string; title: string; label?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = `${SITE}${path}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <SocialIcon name="linkedin" className="h-4 w-4" /> },
    {
      label: "Share on X",
      href: `https://x.com/intent/post?url=${u}&text=${t}`,
      icon: (
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L2.9 2h6.4l4.4 5.9L18.9 2zm-1.1 18h1.7L8.3 3.9H6.5L17.8 20z" />
        </svg>
      ),
    },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, icon: <WhatsAppIcon className="h-4 w-4" /> },
    { label: "Share by email", href: `mailto:?subject=${t}&body=${u}`, icon: <Mail className="h-4 w-4" /> },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href.split("#")[0] : url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: no-op */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.12em] text-subtle">Share</span>}
      <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} className={`${btn} ${copied ? "!border-ink !bg-brand !text-ink" : ""}`}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
      {links.map((l) => (
        <a key={l.label} href={l.href} target={l.href.startsWith("mailto:") ? undefined : "_blank"} rel="noopener noreferrer" aria-label={l.label} className={btn}>
          {l.icon}
        </a>
      ))}
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </div>
  );
}

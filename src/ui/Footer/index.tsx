import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import Logo from "@/../public/logo.png";
import { footerNav, legalNav } from "@/content/nav";
import { contact, footer, socials } from "@/content/site";
import { EnquireButton } from "@/ui/Enquiry";
import { SocialIcon } from "@/ui/Icons";
import PronounceButton from "./PronounceButton";
import SubscribeButton from "./SubscribeButton";

export default function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="overflow-hidden rounded-[var(--radius-panel)] bg-graphite text-white">
        {/* CTA band */}
        <div className="container-x grid gap-10 border-b border-white/10 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow mb-5 text-white/50">Let&apos;s work safer</p>
            <h2 className="display-lg text-white">
              Need equipment on site
              <br className="hidden sm:block" /> <span className="text-brand">this week?</span>
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <EnquireButton className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 text-sm font-medium text-ink transition-colors hover:bg-white">
                Get a quote <ArrowUpRight className="h-4 w-4" />
              </EnquireButton>
              <Link
                href="/products"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-medium text-white no-underline transition-colors hover:border-white"
              >
                Browse equipment
              </Link>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Phone, label: "Call", value: contact.phone, href: contact.phoneHref },
              { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
              { icon: MessageCircle, label: "WhatsApp", value: "Chat with sales", href: contact.whatsapp },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 rounded-2xl bg-white/[0.04] px-4 py-3.5 no-underline transition-colors hover:bg-white/[0.08]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-brand">
                  <c.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{c.label}</span>
                  <span className="block truncate text-sm text-white">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" aria-label="MT&T home">
              <Image src={Logo} alt="MT&T — Since 1974" height={48} className="h-12 w-auto" />
            </Link>
            <div className="mt-5 flex items-start gap-3">
              <PronounceButton src={footer.pronunciationAudio} />
              <p className="text-sm leading-relaxed text-white/55">{footer.blurb}</p>
            </div>
            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] text-white/80 transition-colors hover:bg-brand hover:text-ink"
                >
                  <SocialIcon name={s.key} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <SubscribeButton />
            </div>
          </div>
          {footerNav.map((col) => (
            <div key={col.title}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-white/70 no-underline transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="container-x flex flex-col items-start justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Mtandt Group. All rights reserved.</p>
          <div className="flex gap-5">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/40 no-underline hover:text-white">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

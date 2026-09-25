import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";
import { footer, socials } from "@/content/site";
import { SocialIcon } from "@/ui/Icons";
import AssistBanner from "./AssistBanner";
import BackToTopButton from "./BackToTopButton";
import PronounceButton from "./PronounceButton";
import SubscribeButton from "./SubscribeButton";

const mutedLink = "text-[13px] leading-6 text-white/60 no-underline hover:text-brand";

export default function Footer() {
  return (
    <footer className="relative">
      <BackToTopButton />
      <AssistBanner />
      <div className="bg-[#101010]">
        <div className="default-margin grid grid-cols-1 gap-10 pt-10 pb-6 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
          <div className="flex max-w-64 flex-col gap-4">
            <Link href="/" aria-label="MT&T home">
              <Image src={Logo} alt="MT&T — Since 1974" width={180} height={69} className="h-auto w-44" />
            </Link>
            <PronounceButton src={footer.pronunciationAudio} />
            <p className="text-[13px] leading-relaxed text-white/60">{footer.blurb}</p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-brand hover:text-ink"
                >
                  <SocialIcon name={s.key} className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            <SubscribeButton />
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-base font-semibold text-white">{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href} className="leading-6">
                    <Link href={l.href} className={mutedLink}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="default-margin flex flex-col items-center justify-between gap-2 border-t border-white/10 py-4 sm:flex-row">
          <p className="text-[12px] text-white/50">
            Copyright © {new Date().getFullYear()}. All Rights Reserved | MTandT Group.
          </p>
          <div className="flex gap-4">
            {footer.legal.map((l) => (
              <Link key={l.href} href={l.href} className="text-[12px] text-white/50 no-underline hover:text-brand">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

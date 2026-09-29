import Link from "next/link";
import Image from "next/image";
import Logo from "@/../public/logo.png";
import { contact, mainNav, socials } from "@/content/site";
import { MailIcon, PhoneIcon, SocialIcon } from "@/ui/Icons";
import NavBar from "./NavBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-brand-light">
        <div className="default-margin flex items-center justify-between gap-4 py-1.5 text-[13px]">
          <div className="flex items-center gap-5">
            <a href={contact.phoneHref} className="flex items-center gap-1.5 text-ink no-underline">
              <PhoneIcon className="h-3.5 w-3.5" />
              {contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="hidden items-center gap-1.5 text-ink no-underline sm:flex">
              <MailIcon className="h-3.5 w-3.5" />
              {contact.email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {socials.map((s) => (
              <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="text-ink hover:opacity-70">
                <SocialIcon name={s.key} className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-black">
        <div className="default-margin flex h-16 items-center justify-between">
          <Link href="/" aria-label="MT&T home" className="shrink-0">
            <Image src={Logo} alt="MT&T — Since 1974" width={126} height={48} priority className="h-12 w-auto" />
          </Link>
          <NavBar items={mainNav} />
        </div>
      </div>
    </header>
  );
}
